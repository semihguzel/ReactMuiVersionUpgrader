import { describe, it, expect } from '@jest/globals';
import { transformJssClasses } from '../../src/transformers/styles/jssClasses.js';
import { transformMakeStylesImport } from '../../src/transformers/styles/makeStylesImport.js';

// ─── jssClasses ───────────────────────────────────────────────────────────────

describe('jssClasses transformer', () => {
  it('should replace &$focused with &.Mui-focused', () => {
    const input = `const useStyles = makeStyles({
  root: {
    '&$focused': { color: 'blue' },
  },
});`;
    const result = transformJssClasses(input, 'test.js');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('&.Mui-focused');
    expect(result.source).not.toContain('&$focused');
  });

  it('should replace descendant "& $disabled" with "& .Mui-disabled"', () => {
    const input = `const useStyles = makeStyles({
  root: {
    '& $disabled': { opacity: 0.5 },
  },
});`;
    const result = transformJssClasses(input, 'test.js');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('& .Mui-disabled');
    expect(result.source).not.toContain('& $disabled');
  });

  it('should replace $selected at the start of a quoted selector', () => {
    const input = `const useStyles = makeStyles({
  root: {
    '$selected &': { fontWeight: 'bold' },
  },
});`;
    const result = transformJssClasses(input, 'test.js');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('.Mui-selected');
    expect(result.source).not.toContain('$selected');
  });

  it('should handle multiple JSS selectors in the same file', () => {
    const input = `const useStyles = makeStyles({
  root: {
    '&$checked': { color: 'green' },
    '&$error': { color: 'red' },
    '& $expanded': { padding: 0 },
  },
});`;
    const result = transformJssClasses(input, 'test.js');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('&.Mui-checked');
    expect(result.source).toContain('&.Mui-error');
    expect(result.source).toContain('& .Mui-expanded');
  });

  it('should also trigger on withStyles calls', () => {
    const input = `const Styled = withStyles({
  label: {
    '&$disabled': { color: 'grey' },
  },
})(MyComponent);`;
    const result = transformJssClasses(input, 'test.js');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('&.Mui-disabled');
  });

  it('should not change files without JSS pseudo-class patterns', () => {
    const input = `const styles = { root: { color: 'red', padding: 8 } };`;
    const result = transformJssClasses(input, 'test.js');
    expect(result.changed).toBe(false);
  });
});

// ─── makeStylesImport ─────────────────────────────────────────────────────────

describe('makeStylesImport transformer', () => {
  it('should split makeStyles and createTheme into separate imports', () => {
    const input = `import { makeStyles, createTheme } from '@mui/material/styles';`;
    const result = transformMakeStylesImport(input, 'test.js');
    expect(result.changed).toBe(true);
    expect(result.source).toContain(`from '@mui/material/styles'`);
    expect(result.source).toContain(`from '@mui/styles'`);
  });

  it('should keep createTheme in @mui/material/styles and move makeStyles out', () => {
    const input = `import { makeStyles, createTheme } from '@mui/material/styles';`;
    const result = transformMakeStylesImport(input, 'test.js');
    expect(result.source).toMatch(/import \{ createTheme \} from '@mui\/material\/styles'/);
    expect(result.source).toMatch(/import \{ makeStyles \} from '@mui\/styles'/);
  });

  it('should move makeStyles and withStyles together to @mui/styles', () => {
    const input = `import { makeStyles, withStyles, createTheme } from '@mui/material/styles';`;
    const result = transformMakeStylesImport(input, 'test.js');
    expect(result.changed).toBe(true);
    expect(result.source).toMatch(/import \{ makeStyles, withStyles \} from '@mui\/styles'/);
    expect(result.source).toContain('createTheme');
  });

  it('should move makeStyles from @mui/material barrel import', () => {
    const input = `import { Button, makeStyles } from '@mui/material';`;
    const result = transformMakeStylesImport(input, 'test.js');
    expect(result.changed).toBe(true);
    expect(result.source).toContain(`from '@mui/material'`);
    expect(result.source).toContain(`from '@mui/styles'`);
    expect(result.source).toContain('Button');
    expect(result.source).toContain('makeStyles');
  });

  it('should emit a warning about the legacy @mui/styles package', () => {
    const input = `import { makeStyles } from '@mui/material/styles';`;
    const result = transformMakeStylesImport(input, 'test.js');
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('@mui/styles');
  });

  it('should not change imports containing only modern exports', () => {
    const input = `import { createTheme, alpha } from '@mui/material/styles';`;
    const result = transformMakeStylesImport(input, 'test.js');
    expect(result.changed).toBe(false);
  });

  it('should handle double-quote import paths', () => {
    const input = `import { makeStyles, createTheme } from "@mui/material/styles";`;
    const result = transformMakeStylesImport(input, 'test.js');
    expect(result.changed).toBe(true);
    expect(result.source).toContain(`from "@mui/styles"`);
  });
});
