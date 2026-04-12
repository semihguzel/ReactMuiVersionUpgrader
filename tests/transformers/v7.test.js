import { describe, it, expect } from '@jest/globals';
import { transformDeepImportPaths } from '../../src/transformers/v7/imports/deepImportPaths.js';
import { transformStyledEngineProvider } from '../../src/transformers/v7/imports/styledEngineProvider.js';
import { transformGridRename } from '../../src/transformers/v7/imports/gridRename.js';
import { transformLabRemovedComponents } from '../../src/transformers/v7/imports/labRemovedComponents.js';
import { transformInputLabelSize } from '../../src/transformers/v7/props/inputLabelSize.js';
import { transformRemovedApis } from '../../src/transformers/v7/warnings/removedApis.js';

// ─── deepImportPaths ─────────────────────────────────────────────────────────

describe('deepImportPaths transformer (v7)', () => {
  it('should fix @mui/material/styles/createTheme → @mui/material/styles', () => {
    const input = `import createTheme from '@mui/material/styles/createTheme';`;
    const result = transformDeepImportPaths(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).toBe(`import createTheme from '@mui/material/styles';`);
  });

  it('should fix @mui/material/TablePagination/TablePaginationActions → @mui/material/TablePaginationActions', () => {
    const input = `import TablePaginationActions from '@mui/material/TablePagination/TablePaginationActions';`;
    const result = transformDeepImportPaths(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).toBe(`import TablePaginationActions from '@mui/material/TablePaginationActions';`);
  });

  it('should handle double quotes', () => {
    const input = `import createTheme from "@mui/material/styles/createTheme";`;
    const result = transformDeepImportPaths(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).toBe(`import createTheme from "@mui/material/styles";`);
  });

  it('should not change valid import paths', () => {
    const input = `import { createTheme } from '@mui/material/styles';`;
    const result = transformDeepImportPaths(input, 'test.tsx');
    expect(result.changed).toBe(false);
  });

  it('should not change non-MUI imports', () => {
    const input = `import something from 'some-other-lib/deep/path';`;
    const result = transformDeepImportPaths(input, 'test.tsx');
    expect(result.changed).toBe(false);
  });
});

// ─── styledEngineProvider ────────────────────────────────────────────────────

describe('styledEngineProvider transformer (v7)', () => {
  it('should move StyledEngineProvider from @mui/material to @mui/material/styles', () => {
    const input = `import { Button, StyledEngineProvider } from '@mui/material';`;
    const result = transformStyledEngineProvider(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain(`from '@mui/material/styles'`);
    expect(result.source).toContain('StyledEngineProvider');
    expect(result.source).toContain(`import { Button }`);
  });

  it('should remove the entire import line when SEP is the only specifier', () => {
    const input = `import { StyledEngineProvider } from '@mui/material';`;
    const result = transformStyledEngineProvider(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).not.toContain(`from '@mui/material';`);
    expect(result.source).toContain(`from '@mui/material/styles'`);
  });

  it('should be no-op when already imported from @mui/material/styles', () => {
    const input = `import { StyledEngineProvider } from '@mui/material/styles';`;
    const result = transformStyledEngineProvider(input, 'test.tsx');
    expect(result.changed).toBe(false);
    expect(result.source).toBe(input);
  });

  it('should be no-op when StyledEngineProvider is not present', () => {
    const input = `import { Button } from '@mui/material';`;
    const result = transformStyledEngineProvider(input, 'test.tsx');
    expect(result.changed).toBe(false);
  });
});

// ─── gridRename ──────────────────────────────────────────────────────────────

describe('gridRename transformer (v7)', () => {
  it('should rename Grid import → GridLegacy', () => {
    const input = `import { Grid } from '@mui/material';`;
    const result = transformGridRename(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('GridLegacy');
    expect(result.source).not.toMatch(/[^a-zA-Z]Grid[^2La-zA-Z]/);
  });

  it('should rename Grid2 import → Grid', () => {
    const input = `import { Grid2 } from '@mui/material';`;
    const result = transformGridRename(input, 'test.tsx');
    expect(result.changed).toBe(true);
    // After Grid2→Grid rename, we should have Grid but not Grid2
    expect(result.source).not.toContain('Grid2');
  });

  it('should rename both Grid and Grid2 in the same file without collision', () => {
    const input = `import { Grid, Grid2 } from '@mui/material';\n<Grid container><Grid2 item xs={6} /></Grid>`;
    const result = transformGridRename(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('GridLegacy');
    expect(result.source).not.toContain('Grid2');
  });

  it('should rename GridProps → GridLegacyProps', () => {
    // Must include a `Grid` identifier to trigger hasGrid=true so the type rename runs
    const input = `import { Grid } from '@mui/material';\nconst props: GridProps = {};`;
    const result = transformGridRename(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('GridLegacyProps');
    expect(result.source).not.toContain(': GridProps');
  });

  it('should rename deep import @mui/material/Grid → @mui/material/GridLegacy', () => {
    const input = `import Grid from '@mui/material/Grid';`;
    const result = transformGridRename(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain(`'@mui/material/GridLegacy'`);
  });

  it('should rename JSX Grid tags', () => {
    const input = `<Grid container spacing={2}><Grid item xs={6} /></Grid>`;
    const result = transformGridRename(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('<GridLegacy');
    expect(result.source).toContain('</GridLegacy');
  });

  it('should not change file without Grid components', () => {
    const input = `<Button>Click</Button>`;
    const result = transformGridRename(input, 'test.tsx');
    expect(result.changed).toBe(false);
  });

  it('should emit a warning when grid components are renamed', () => {
    const input = `import { Grid } from '@mui/material';`;
    const result = transformGridRename(input, 'test.tsx');
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});

// ─── inputLabelSize ──────────────────────────────────────────────────────────

describe('inputLabelSize transformer (v7)', () => {
  it('should rename size="normal" → size="medium" on InputLabel', () => {
    const input = `<InputLabel size="normal">Label</InputLabel>`;
    const result = transformInputLabelSize(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).toBe(`<InputLabel size="medium">Label</InputLabel>`);
  });

  it('should rename size="normal" → size="medium" on Button', () => {
    const input = `<Button size="normal">Click</Button>`;
    const result = transformInputLabelSize(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('size="medium"');
  });

  it('should rename size="normal" → size="medium" on TextField', () => {
    const input = `<TextField size="normal" label="Name" />`;
    const result = transformInputLabelSize(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('size="medium"');
  });

  it("should rename size={'normal'} → size={'medium'}", () => {
    const input = `<InputLabel size={'normal'}>Label</InputLabel>`;
    const result = transformInputLabelSize(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain(`size={'medium'}`);
  });

  it('should not change when size is already "medium"', () => {
    const input = `<InputLabel size="medium">Label</InputLabel>`;
    const result = transformInputLabelSize(input, 'test.tsx');
    expect(result.changed).toBe(false);
  });

  it('should not change file without target components', () => {
    const input = `<span size="normal">text</span>`;
    const result = transformInputLabelSize(input, 'test.tsx');
    expect(result.changed).toBe(false);
  });
});

// ─── labRemovedComponents ─────────────────────────────────────────────────────

describe('labRemovedComponents transformer (v7)', () => {
  it('should warn about @mui/lab imports', () => {
    const input = `import { TabPanel } from '@mui/lab';`;
    const result = transformLabRemovedComponents(input, 'test.tsx');
    expect(result.changed).toBe(false);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('@mui/lab');
  });

  it('should warn about deep @mui/lab imports', () => {
    const input = `import TabPanel from '@mui/lab/TabPanel';`;
    const result = transformLabRemovedComponents(input, 'test.tsx');
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('should not warn when no @mui/lab imports', () => {
    const input = `import { Button } from '@mui/material';`;
    const result = transformLabRemovedComponents(input, 'test.tsx');
    expect(result.warnings.length).toBe(0);
    expect(result.changed).toBe(false);
  });

  it('should never modify source', () => {
    const input = `import { TabPanel } from '@mui/lab';`;
    const result = transformLabRemovedComponents(input, 'test.tsx');
    expect(result.source).toBe(input);
  });
});

// ─── removedApis (v7) ────────────────────────────────────────────────────────

describe('removedApis transformer (v7)', () => {
  it('should warn about onBackdropClick', () => {
    const input = `<Modal onBackdropClick={handleClose} open={open} />`;
    const result = transformRemovedApis(input, 'test.tsx');
    expect(result.changed).toBe(false);
    expect(result.warnings.some(w => w.includes('onBackdropClick'))).toBe(true);
  });

  it('should warn about experimentalStyled', () => {
    const input = `import { experimentalStyled as styled } from '@mui/material/styles';`;
    const result = transformRemovedApis(input, 'test.tsx');
    expect(result.warnings.some(w => w.includes('experimentalStyled'))).toBe(true);
  });

  it('should warn about Hidden component', () => {
    const input = `<Hidden mdDown><p>content</p></Hidden>`;
    const result = transformRemovedApis(input, 'test.tsx');
    expect(result.warnings.some(w => w.includes('Hidden'))).toBe(true);
  });

  it('should warn about MuiRating-readOnly CSS class', () => {
    const input = `const styles = { '& .MuiRating-readOnly': { color: 'grey' } };`;
    const result = transformRemovedApis(input, 'test.tsx');
    expect(result.warnings.some(w => w.includes('MuiRating-readOnly'))).toBe(true);
  });

  it('should warn about StepButtonIcon type', () => {
    const input = `const icon: StepButtonIcon = 1;`;
    const result = transformRemovedApis(input, 'test.tsx');
    expect(result.warnings.some(w => w.includes('StepButtonIcon'))).toBe(true);
  });

  it('should not warn when no removed APIs are used', () => {
    const input = `<Button>Click</Button>`;
    const result = transformRemovedApis(input, 'test.tsx');
    expect(result.warnings.length).toBe(0);
  });

  it('should never modify source', () => {
    const input = `<Modal onBackdropClick={fn} open />`;
    const result = transformRemovedApis(input, 'test.tsx');
    expect(result.source).toBe(input);
    expect(result.changed).toBe(false);
  });
});
