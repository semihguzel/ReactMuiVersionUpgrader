import { describe, it, expect } from '@jest/globals';
import { transformGenericProps } from '../../src/transformers/props/genericPropRename.js';
import { transformVariantDefaults } from '../../src/transformers/props/variantDefaults.js';
import { transformLinkUnderline } from '../../src/transformers/props/linkUnderline.js';

// ─── genericPropRename ────────────────────────────────────────────────────────

describe('genericPropRename transformer', () => {
  it('should rename Grid justify to justifyContent', () => {
    const input = `import { Grid } from '@mui/material';
<Grid container justify="flex-start" />`;
    const result = transformGenericProps(input, 'test.jsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('justifyContent="flex-start"');
    expect(result.source).not.toContain(' justify=');
  });

  it('should rename Avatar variant circle to circular', () => {
    const input = `import { Avatar } from '@mui/material';
<Avatar variant="circle" src="/img.png" />`;
    const result = transformGenericProps(input, 'test.jsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('variant="circular"');
    expect(result.source).not.toContain('variant="circle"');
  });

  it('should rename Skeleton variant rect to rectangular', () => {
    const input = `import { Skeleton } from '@mui/material';
<Skeleton variant="rect" width={200} height={100} />`;
    const result = transformGenericProps(input, 'test.jsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('variant="rectangular"');
    expect(result.source).not.toContain('variant="rect"');
  });

  it('should rename TablePagination onChangePage to onPageChange', () => {
    const input = `import { TablePagination } from '@mui/material';
<TablePagination onChangePage={handlePageChange} count={100} />`;
    const result = transformGenericProps(input, 'test.jsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('onPageChange=');
    expect(result.source).not.toContain('onChangePage=');
  });

  it('should emit warning for removed Dialog prop disableBackdropClick', () => {
    const input = `import { Dialog } from '@mui/material';
<Dialog disableBackdropClick onClose={handleClose}>content</Dialog>`;
    const result = transformGenericProps(input, 'test.jsx');
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('disableBackdropClick');
  });

  it('should handle imported component aliases', () => {
    const input = `import { Grid as MyGrid } from '@mui/material';
<MyGrid container justify="center" />`;
    const result = transformGenericProps(input, 'test.jsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('justifyContent="center"');
  });

  it('should not change files without MUI imports', () => {
    const input = `<Grid container justify="flex-start" />`;
    const result = transformGenericProps(input, 'test.jsx');
    expect(result.changed).toBe(false);
  });
});

// ─── variantDefaults ──────────────────────────────────────────────────────────

describe('variantDefaults transformer', () => {
  it('should add variant="standard" to TextField without variant', () => {
    const input = `import { TextField } from '@mui/material';
<TextField label="Name" />`;
    const result = transformVariantDefaults(input, 'test.jsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('variant="standard"');
  });

  it('should add variant="standard" to Select without variant', () => {
    const input = `import { Select } from '@mui/material';
<Select value={val} onChange={handleChange} />`;
    const result = transformVariantDefaults(input, 'test.jsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('variant="standard"');
  });

  it('should add variant="standard" to FormControl without variant', () => {
    const input = `import { FormControl } from '@mui/material';
<FormControl><input /></FormControl>`;
    const result = transformVariantDefaults(input, 'test.jsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('variant="standard"');
  });

  it('should not add variant when it is already specified', () => {
    const input = `import { TextField } from '@mui/material';
<TextField variant="outlined" label="Name" />`;
    const result = transformVariantDefaults(input, 'test.jsx');
    expect(result.changed).toBe(false);
  });

  it('should not change files without a MUI import', () => {
    const input = `<TextField label="Name" />`;
    const result = transformVariantDefaults(input, 'test.jsx');
    expect(result.changed).toBe(false);
  });
});

// ─── linkUnderline ────────────────────────────────────────────────────────────

describe('linkUnderline transformer', () => {
  it('should add underline="hover" to Link without underline prop', () => {
    const input = `import { Link } from '@mui/material';
<Link href="/home">Home</Link>`;
    const result = transformLinkUnderline(input, 'test.jsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('underline="hover"');
  });

  it('should add underline="hover" to self-closing Link', () => {
    const input = `import { Link } from '@mui/material';
<Link href="/home" />`;
    const result = transformLinkUnderline(input, 'test.jsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('underline="hover"');
  });

  it('should not change Link that already has an underline prop', () => {
    const input = `import { Link } from '@mui/material';
<Link href="/home" underline="always">Home</Link>`;
    const result = transformLinkUnderline(input, 'test.jsx');
    expect(result.changed).toBe(false);
  });

  it('should not change Link imported from a non-MUI package', () => {
    const input = `import { Link } from 'react-router-dom';
<Link to="/home">Home</Link>`;
    const result = transformLinkUnderline(input, 'test.jsx');
    expect(result.changed).toBe(false);
  });

  it('should not change files that do not use Link', () => {
    const input = `import { Button } from '@mui/material';
<Button>Click</Button>`;
    const result = transformLinkUnderline(input, 'test.jsx');
    expect(result.changed).toBe(false);
  });
});
