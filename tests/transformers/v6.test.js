import { describe, it, expect } from '@jest/globals';
import { transformGrid2Rename } from '../../src/transformers/v6/imports/grid2Rename.js';
import { transformSlotsProps } from '../../src/transformers/v6/props/slotsProps.js';
import { transformAccordionSlots } from '../../src/transformers/v6/props/accordionSlots.js';
import { transformListItemButton } from '../../src/transformers/v6/props/listItemButton.js';
import { transformListItemTextSlots } from '../../src/transformers/v6/props/listItemTextSlots.js';
import { transformSystemProps } from '../../src/transformers/v6/props/systemProps.js';
import { transformVariantDefaultsV6 } from '../../src/transformers/v6/props/variantDefaultsV6.js';
import { transformApplyStyles } from '../../src/transformers/v6/theme/applyStyles.js';

// ─── grid2Rename ─────────────────────────────────────────────────────────────

describe('grid2Rename transformer', () => {
  it('should rename deep import path Unstable_Grid2 → Grid2', () => {
    const input = `import Grid2 from '@mui/material/Unstable_Grid2';`;
    const result = transformGrid2Rename(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).toBe(`import Grid2 from '@mui/material/Grid2';`);
  });

  it('should rename named import specifier Unstable_Grid2', () => {
    const input = `import { Unstable_Grid2 } from '@mui/material';`;
    const result = transformGrid2Rename(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).toBe(`import { Grid2 } from '@mui/material';`);
  });

  it('should rename Unstable_Grid2 in JSX', () => {
    const input = `<Unstable_Grid2 container spacing={2}><Unstable_Grid2 item /></Unstable_Grid2>`;
    const result = transformGrid2Rename(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).not.toContain('Unstable_Grid2');
    expect(result.source).toContain('Grid2');
  });

  it('should remove disableEqualOverflow prop with warning', () => {
    const input = `<Grid2 container disableEqualOverflow spacing={2} />`;
    const result = transformGrid2Rename(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).not.toContain('disableEqualOverflow');
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('disableEqualOverflow');
  });

  it('should not change file without Unstable_Grid2', () => {
    const input = `import { Button } from '@mui/material';`;
    const result = transformGrid2Rename(input, 'test.tsx');
    expect(result.changed).toBe(false);
    expect(result.source).toBe(input);
  });
});

// ─── slotsProps ──────────────────────────────────────────────────────────────

describe('slotsProps transformer', () => {
  it('should rename components= → slots= on Modal', () => {
    const input = `<Modal components={{ backdrop: CustomBackdrop }} open={open} />`;
    const result = transformSlotsProps(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('slots=');
    expect(result.source).not.toContain('components=');
  });

  it('should rename componentsProps= → slotProps= on Tooltip', () => {
    const input = `<Tooltip componentsProps={{ tooltip: { sx: {} } }} title="hi"><span /></Tooltip>`;
    const result = transformSlotsProps(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('slotProps=');
    expect(result.source).not.toContain('componentsProps=');
  });

  it('should migrate TransitionComponent on Modal → slots', () => {
    const input = `<Modal TransitionComponent={Fade} open={open} />`;
    const result = transformSlotsProps(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('slots={{ transition: Fade }}');
    expect(result.source).not.toContain('TransitionComponent=');
  });

  it('should migrate BackdropProps on Modal → slotProps.backdrop', () => {
    const input = `<Modal BackdropProps={{ timeout: 500 }} open={open} />`;
    const result = transformSlotsProps(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('slotProps=');
    expect(result.source).not.toContain('BackdropProps=');
  });

  it('should not change file without target components', () => {
    const input = `<Button>Click me</Button>`;
    const result = transformSlotsProps(input, 'test.tsx');
    expect(result.changed).toBe(false);
  });
});

// ─── accordionSlots ───────────────────────────────────────────────────────────

describe('accordionSlots transformer', () => {
  it('should migrate TransitionComponent on Accordion → slots.transition', () => {
    const input = `<Accordion TransitionComponent={Fade}><AccordionSummary>Title</AccordionSummary></Accordion>`;
    const result = transformAccordionSlots(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('slots={{ transition: Fade }}');
    expect(result.source).not.toContain('TransitionComponent=');
  });

  it('should migrate TransitionProps on Accordion → slotProps.transition', () => {
    const input = `<Accordion TransitionProps={{ unmountOnExit: true }}><AccordionSummary>T</AccordionSummary></Accordion>`;
    const result = transformAccordionSlots(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('slotProps=');
    expect(result.source).not.toContain('TransitionProps=');
  });

  it('should not change Accordion without TransitionComponent/TransitionProps', () => {
    const input = `<Accordion><AccordionSummary>Title</AccordionSummary></Accordion>`;
    const result = transformAccordionSlots(input, 'test.tsx');
    expect(result.changed).toBe(false);
  });

  it('should not change file without Accordion', () => {
    const input = `<Button>Click</Button>`;
    const result = transformAccordionSlots(input, 'test.tsx');
    expect(result.changed).toBe(false);
  });
});

// ─── listItemButton ───────────────────────────────────────────────────────────

describe('listItemButton transformer', () => {
  it('should replace <ListItem button> with <ListItemButton>', () => {
    const input = `import { ListItem } from '@mui/material';\n<ListItem button>\n  <span>Item</span>\n</ListItem>`;
    const result = transformListItemButton(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('<ListItemButton>');
    expect(result.source).not.toContain('<ListItem button>');
  });

  it('should add ListItemButton to the @mui/material import', () => {
    const input = `import { ListItem } from '@mui/material';\n<ListItem button><span /></ListItem>`;
    const result = transformListItemButton(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('ListItemButton');
  });

  it('should warn and skip when <ListItem button> has spread props', () => {
    const input = `import { ListItem } from '@mui/material';\n<ListItem button {...rest}><span /></ListItem>`;
    const result = transformListItemButton(input, 'test.tsx');
    expect(result.changed).toBe(false);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('spread');
  });

  it('should not change file without ListItem', () => {
    const input = `<Button>Click</Button>`;
    const result = transformListItemButton(input, 'test.tsx');
    expect(result.changed).toBe(false);
  });
});

// ─── listItemTextSlots ────────────────────────────────────────────────────────

describe('listItemTextSlots transformer', () => {
  it('should migrate primaryTypographyProps → slotProps.primary', () => {
    const input = `<ListItemText primaryTypographyProps={{ variant: 'h6' }} />`;
    const result = transformListItemTextSlots(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain("slotProps={{ primary: { variant: 'h6' } }}");
    expect(result.source).not.toContain('primaryTypographyProps=');
  });

  it('should migrate secondaryTypographyProps → slotProps.secondary', () => {
    const input = `<ListItemText secondaryTypographyProps={{ color: 'text.secondary' }} />`;
    const result = transformListItemTextSlots(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('slotProps=');
    expect(result.source).not.toContain('secondaryTypographyProps=');
  });

  it('should merge primary and secondary into one slotProps', () => {
    const input = `<ListItemText primaryTypographyProps={{ variant: 'h6' }} secondaryTypographyProps={{ color: 'grey' }} />`;
    const result = transformListItemTextSlots(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('slotProps=');
    expect(result.source).toContain('primary:');
    expect(result.source).toContain('secondary:');
    expect(result.source).not.toContain('primaryTypographyProps=');
    expect(result.source).not.toContain('secondaryTypographyProps=');
  });

  it('should not change file without ListItemText', () => {
    const input = `<Button>Click</Button>`;
    const result = transformListItemTextSlots(input, 'test.tsx');
    expect(result.changed).toBe(false);
  });
});

// ─── systemProps ──────────────────────────────────────────────────────────────

describe('systemProps transformer', () => {
  it('should migrate simple system prop mt on Box → sx', () => {
    const input = `<Box mt={2} />`;
    const result = transformSystemProps(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('sx={{ mt: 2 }}');
    expect(result.source).not.toContain(' mt={2}');
  });

  it('should migrate multiple system props on Stack → sx', () => {
    const input = `<Stack mt={2} mb={4} />`;
    const result = transformSystemProps(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('sx={{');
    expect(result.source).toContain('mt: 2');
    expect(result.source).toContain('mb: 4');
  });

  it('should warn about dynamic system prop (not auto-migrate)', () => {
    const input = `<Box mt={spacing} />`;
    const result = transformSystemProps(input, 'test.tsx');
    expect(result.changed).toBe(false);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('mt');
  });

  it('should warn about color on Typography', () => {
    const input = `<Typography color="primary">text</Typography>`;
    const result = transformSystemProps(input, 'test.tsx');
    expect(result.warnings.some(w => w.includes('color'))).toBe(true);
  });

  it('should not change file without target components', () => {
    const input = `<Button mt={2}>Click</Button>`;
    const result = transformSystemProps(input, 'test.tsx');
    expect(result.changed).toBe(false);
  });
});

// ─── variantDefaultsV6 ────────────────────────────────────────────────────────

describe('variantDefaultsV6 transformer', () => {
  it('should warn about TextField without explicit variant', () => {
    const input = `<TextField label="Name" />`;
    const result = transformVariantDefaultsV6(input, 'test.tsx');
    expect(result.changed).toBe(false);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('TextField');
    expect(result.warnings[0]).toContain('variant');
  });

  it('should warn about Select without explicit variant', () => {
    const input = `<Select value={val}><MenuItem value="a">A</MenuItem></Select>`;
    const result = transformVariantDefaultsV6(input, 'test.tsx');
    expect(result.changed).toBe(false);
    expect(result.warnings.some(w => w.includes('Select'))).toBe(true);
  });

  it('should not warn about TextField with explicit variant', () => {
    const input = `<TextField variant="outlined" label="Name" />`;
    const result = transformVariantDefaultsV6(input, 'test.tsx');
    expect(result.warnings.length).toBe(0);
  });

  it('should not warn about Select with explicit variant', () => {
    const input = `<Select variant="standard" value={val} />`;
    const result = transformVariantDefaultsV6(input, 'test.tsx');
    expect(result.warnings.length).toBe(0);
  });

  it('should never modify source', () => {
    const input = `<TextField label="Name" />`;
    const result = transformVariantDefaultsV6(input, 'test.tsx');
    expect(result.source).toBe(input);
    expect(result.changed).toBe(false);
  });
});

// ─── applyStyles ──────────────────────────────────────────────────────────────

describe('applyStyles transformer', () => {
  it('should warn about palette.mode === "dark"', () => {
    const input = `const isDark = theme.palette.mode === 'dark';`;
    const result = transformApplyStyles(input, 'test.tsx');
    expect(result.changed).toBe(false);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('palette.mode');
  });

  it('should warn about palette.mode !== "light"', () => {
    const input = `if (palette.mode !== 'light') {}`;
    const result = transformApplyStyles(input, 'test.tsx');
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('should warn about palette.mode == "dark"', () => {
    const input = `const c = palette.mode == 'dark' ? 'white' : 'black';`;
    const result = transformApplyStyles(input, 'test.tsx');
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('should not warn when no palette.mode comparison', () => {
    const input = `const theme = createTheme({ palette: { mode: 'dark' } });`;
    const result = transformApplyStyles(input, 'test.tsx');
    expect(result.warnings.length).toBe(0);
  });

  it('should never modify source', () => {
    const input = `if (palette.mode === 'dark') {}`;
    const result = transformApplyStyles(input, 'test.tsx');
    expect(result.source).toBe(input);
    expect(result.changed).toBe(false);
  });
});
