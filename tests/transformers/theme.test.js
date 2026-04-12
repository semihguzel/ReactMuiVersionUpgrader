import { describe, it, expect } from '@jest/globals';
import { transformCreateTheme } from '../../src/transformers/theme/createTheme.js';
import { transformPaletteMode } from '../../src/transformers/theme/paletteMode.js';
import { transformFadeToAlpha } from '../../src/transformers/theme/fadeToAlpha.js';

describe('createTheme transformer', () => {
  it('should rename createMuiTheme to createTheme', () => {
    const input = `const theme = createMuiTheme({ palette: {} });`;
    const result = transformCreateTheme(input, 'test.js');
    expect(result.changed).toBe(true);
    expect(result.source).toBe(`const theme = createTheme({ palette: {} });`);
  });

  it('should rename in imports', () => {
    const input = `import { createMuiTheme } from '@mui/material/styles';`;
    const result = transformCreateTheme(input, 'test.js');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('createTheme');
    expect(result.source).not.toContain('createMuiTheme');
  });

  it('should not change files without createMuiTheme', () => {
    const input = `const theme = createTheme({});`;
    const result = transformCreateTheme(input, 'test.js');
    expect(result.changed).toBe(false);
  });
});

describe('paletteMode transformer', () => {
  it('should rename palette.type to palette.mode in objects', () => {
    const input = `const theme = createTheme({ palette: { type: 'dark' } });`;
    const result = transformPaletteMode(input, 'test.js');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('mode:');
    expect(result.source).not.toContain('type:');
  });

  it('should rename palette.type property access', () => {
    const input = `const mode = theme.palette.type;`;
    const result = transformPaletteMode(input, 'test.js');
    expect(result.changed).toBe(true);
    expect(result.source).toBe(`const mode = theme.palette.mode;`);
  });

  it('should rename bracket access', () => {
    const input = `const mode = palette['type'];`;
    const result = transformPaletteMode(input, 'test.js');
    expect(result.changed).toBe(true);
    expect(result.source).toBe(`const mode = palette['mode'];`);
  });
});

describe('fadeToAlpha transformer', () => {
  it('should rename fade to alpha', () => {
    const input = `import { fade } from '@mui/material/styles';\nconst c = fade('#000', 0.5);`;
    const result = transformFadeToAlpha(input, 'test.js');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('import { alpha }');
    expect(result.source).toContain('alpha(');
    expect(result.source).not.toContain('fade');
  });

  it('should not rename fade if not from MUI', () => {
    const input = `import { fade } from 'my-lib';\nfade('#000', 0.5);`;
    const result = transformFadeToAlpha(input, 'test.js');
    expect(result.changed).toBe(false);
  });
});
