import { describe, it, expect } from '@jest/globals';
import { transformLicenseInfo } from '../../src/transformers/v8/imports/licenseInfo.js';
import { transformComponentsPropsToSlotProps } from '../../src/transformers/v8/imports/componentsPropsToSlotProps.js';
import { transformIconRenames } from '../../src/transformers/v8/imports/iconRenames.js';
import { transformUnstableFeatures } from '../../src/transformers/v8/imports/unstableFeatures.js';
import { transformHookRenames } from '../../src/transformers/v8/imports/hookRenames.js';
import { transformSelectorRenames } from '../../src/transformers/v8/imports/selectorRenames.js';
import { transformGridSizeProps } from '../../src/transformers/v8/props/gridSizeProps.js';
import { transformRemovedApis } from '../../src/transformers/v8/warnings/removedApis.js';

// ─── licenseInfo ─────────────────────────────────────────────────────────────

describe('licenseInfo transformer (v8)', () => {
  it('should migrate LicenseInfo from @mui/x-data-grid-pro → @mui/x-license', () => {
    const input = `import { LicenseInfo } from '@mui/x-data-grid-pro';`;
    const result = transformLicenseInfo(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain(`from '@mui/x-license'`);
    expect(result.source).not.toContain(`from '@mui/x-data-grid-pro'`);
  });

  it('should migrate LicenseInfo from @mui/x-data-grid-premium → @mui/x-license', () => {
    const input = `import { LicenseInfo } from '@mui/x-data-grid-premium';`;
    const result = transformLicenseInfo(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain(`from '@mui/x-license'`);
  });

  it('should keep other specifiers in their original package', () => {
    const input = `import { LicenseInfo, GridColDef } from '@mui/x-data-grid-pro';`;
    const result = transformLicenseInfo(input, 'test.tsx');
    // The whole import line source changes to point to @mui/x-license
    expect(result.changed).toBe(true);
    expect(result.source).toContain('LicenseInfo');
    expect(result.source).toContain(`from '@mui/x-license'`);
  });

  it('should be no-op when LicenseInfo not present', () => {
    const input = `import { DataGrid } from '@mui/x-data-grid-pro';`;
    const result = transformLicenseInfo(input, 'test.tsx');
    expect(result.changed).toBe(false);
    expect(result.source).toBe(input);
  });
});

// ─── componentsPropsToSlotProps ───────────────────────────────────────────────

describe('componentsPropsToSlotProps transformer (v8)', () => {
  it('should rename componentsProps= → slotProps=', () => {
    const input = `<Autocomplete componentsProps={{ paper: { elevation: 8 } }} />`;
    const result = transformComponentsPropsToSlotProps(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('slotProps=');
    expect(result.source).not.toContain('componentsProps=');
  });

  it('should migrate InputComponent={Bar} → slots={{ input: {Bar} }}', () => {
    // The transformer captures the full JSX value including braces: {CustomInput}
    const input = `<TextField InputComponent={CustomInput} />`;
    const result = transformComponentsPropsToSlotProps(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('slots=');
    expect(result.source).toContain('input');
    expect(result.source).toContain('CustomInput');
    expect(result.source).not.toContain('InputComponent=');
  });

  it('should migrate InputProps={{ ... }} → slotProps with input slot', () => {
    // The transformer wraps the JSX value (which already has outer braces) in slotProps
    const input = `<TextField InputProps={{ className: 'my-input' }} />`;
    const result = transformComponentsPropsToSlotProps(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('slotProps=');
    expect(result.source).toContain('input');
    expect(result.source).toContain('my-input');
    expect(result.source).not.toContain('InputProps=');
  });

  it('should emit a warning when changes are applied', () => {
    const input = `<Foo componentsProps={{ bar: {} }} />`;
    const result = transformComponentsPropsToSlotProps(input, 'test.tsx');
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('should be no-op when no legacy slots API is used', () => {
    const input = `<Button slotProps={{ root: {} }}>Click</Button>`;
    const result = transformComponentsPropsToSlotProps(input, 'test.tsx');
    expect(result.changed).toBe(false);
  });
});

// ─── iconRenames ──────────────────────────────────────────────────────────────

describe('iconRenames transformer (v8)', () => {
  it('should rename InfoOutline → InfoOutlined', () => {
    const input = `import InfoOutline from '@mui/icons-material/InfoOutline';\n<InfoOutline />`;
    const result = transformIconRenames(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('InfoOutlined');
    expect(result.source).not.toContain('InfoOutline\n');
  });

  it('should rename HomeOutline → HomeOutlined', () => {
    const input = `import HomeOutline from '@mui/icons-material/HomeOutline';`;
    const result = transformIconRenames(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('HomeOutlined');
  });

  it('should rename SettingsOutline → SettingsOutlined', () => {
    const input = `import SettingsOutline from '@mui/icons-material/SettingsOutline';`;
    const result = transformIconRenames(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('SettingsOutlined');
  });

  it('should not rename already-correct Outlined icons', () => {
    const input = `import InfoOutlined from '@mui/icons-material/InfoOutlined';`;
    const result = transformIconRenames(input, 'test.tsx');
    // InfoOutlined is not in the list, should not change
    expect(result.source).toBe(input);
  });

  it('should rename InfoOutline in TypeScript SvgIconProps type annotation', () => {
    const input = `const icon: typeof InfoOutline = InfoOutline;`;
    const result = transformIconRenames(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('InfoOutlined');
    expect(result.source).not.toContain('InfoOutline\n');
  });

  it('should not change file with no matching icons', () => {
    const input = `import Add from '@mui/icons-material/Add';`;
    const result = transformIconRenames(input, 'test.tsx');
    expect(result.changed).toBe(false);
  });
});

// ─── unstableFeatures ─────────────────────────────────────────────────────────

describe('unstableFeatures transformer (v8)', () => {
  it('should rename unstable_rowSpanning → rowSpanning', () => {
    const input = `<DataGrid unstable_rowSpanning />`;
    const result = transformUnstableFeatures(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('rowSpanning');
    expect(result.source).not.toContain('unstable_rowSpanning');
  });

  it('should rename unstable_dataSource → dataSource', () => {
    const input = `<DataGrid unstable_dataSource={myDataSource} />`;
    const result = transformUnstableFeatures(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('dataSource=');
    expect(result.source).not.toContain('unstable_dataSource=');
  });

  it('should rename unstable_lazyLoading → lazyLoading', () => {
    const input = `<DataGrid unstable_lazyLoading />`;
    const result = transformUnstableFeatures(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('lazyLoading');
    expect(result.source).not.toContain('unstable_lazyLoading');
  });

  it('should rename unstable_listView → listView', () => {
    const input = `<DataGrid unstable_listView />`;
    const result = transformUnstableFeatures(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('listView');
  });

  it('should rename apiRef.current.unstable_dataSource method call', () => {
    const input = `apiRef.current.unstable_dataSource.fetchRows(id);`;
    const result = transformUnstableFeatures(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('dataSource.fetchRows');
    expect(result.source).not.toContain('unstable_dataSource');
  });

  it('should not change file with no unstable_ props', () => {
    const input = `<DataGrid rows={rows} columns={columns} />`;
    const result = transformUnstableFeatures(input, 'test.tsx');
    expect(result.changed).toBe(false);
  });
});

// ─── hookRenames ──────────────────────────────────────────────────────────────

describe('hookRenames transformer (v8)', () => {
  it('should rename useGridApiEventHandler → useGridEvent', () => {
    const input = `import { useGridApiEventHandler } from '@mui/x-data-grid';\nuseGridApiEventHandler(apiRef, 'rowClick', handler);`;
    const result = transformHookRenames(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('useGridEvent');
    expect(result.source).not.toContain('useGridApiEventHandler');
  });

  it('should rename useGridApiOptionHandler → useGridEventPriority', () => {
    const input = `useGridApiOptionHandler(apiRef, 'rowClick', handler);`;
    const result = transformHookRenames(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('useGridEventPriority');
    expect(result.source).not.toContain('useGridApiOptionHandler');
  });

  it('should not change file with no matching hooks', () => {
    const input = `import { useGridSelector } from '@mui/x-data-grid';`;
    const result = transformHookRenames(input, 'test.tsx');
    expect(result.changed).toBe(false);
  });
});

// ─── selectorRenames ─────────────────────────────────────────────────────────

describe('selectorRenames transformer (v8)', () => {
  it('should rename selectedGridRowsSelector → gridRowSelectionIdsSelector', () => {
    const input = `const rows = selectedGridRowsSelector(apiRef);`;
    const result = transformSelectorRenames(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('gridRowSelectionIdsSelector');
    expect(result.source).not.toContain('selectedGridRowsSelector');
  });

  it('should rename selectedGridRowsCountSelector → gridRowSelectionCountSelector', () => {
    const input = `const count = selectedGridRowsCountSelector(apiRef);`;
    const result = transformSelectorRenames(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('gridRowSelectionCountSelector');
  });

  it('should rename GridListColDef → GridListViewColDef', () => {
    const input = `const col: GridListColDef = { field: 'name' };`;
    const result = transformSelectorRenames(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('GridListViewColDef');
  });

  it('should rename treeViewClasses → simpleTreeViewClasses', () => {
    const input = `const classes = treeViewClasses;`;
    const result = transformSelectorRenames(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('simpleTreeViewClasses');
    expect(result.source).not.toContain('treeViewClasses');
  });

  it('should rename MuiTreeView theme key → MuiSimpleTreeView', () => {
    const input = `const theme = createTheme({ components: { MuiTreeView: { styleOverrides: {} } } });`;
    const result = transformSelectorRenames(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('MuiSimpleTreeView');
    expect(result.source).not.toContain('MuiTreeView');
  });

  it('should rename GridListColDef in TypeScript import type statement', () => {
    const input = `import type { GridListColDef } from '@mui/x-data-grid';`;
    const result = transformSelectorRenames(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).toBe(`import type { GridListViewColDef } from '@mui/x-data-grid';`);
  });

  it('should rename treeViewClasses used as a TypeScript type constraint', () => {
    const input = `type Classes = typeof treeViewClasses;`;
    const result = transformSelectorRenames(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('simpleTreeViewClasses');
  });

  it('should not change file with no matching identifiers', () => {
    const input = `import { DataGrid } from '@mui/x-data-grid';`;
    const result = transformSelectorRenames(input, 'test.tsx');
    expect(result.changed).toBe(false);
  });
});

// ─── gridSizeProps ───────────────────────────────────────────────────────────

describe('gridSizeProps transformer (v8)', () => {
  it('should merge xs/sm/md into size={{ xs, sm, md }}', () => {
    const input = `<Grid xs={12} sm={6} md={4}>content</Grid>`;
    const result = transformGridSizeProps(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('size={{ xs: 12, sm: 6, md: 4 }}');
    expect(result.source).not.toContain(' xs={');
    expect(result.source).not.toContain(' sm={');
    expect(result.source).not.toContain(' md={');
  });

  it('should convert single numeric breakpoint to size={N}', () => {
    const input = `<Grid xs={12}>content</Grid>`;
    const result = transformGridSizeProps(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('size={12}');
  });

  it('should convert boolean shorthand xs to size={{ xs: true }}', () => {
    // A following attribute is needed so the lookahead (?=[\s/>]) matches after `xs`
    const input = `<Grid xs sm={6}>content</Grid>`;
    const result = transformGridSizeProps(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('xs: true');
    expect(result.source).toContain('sm: 6');
    expect(result.source).toContain('size=');
  });

  it('should emit a warning when breakpoints are merged', () => {
    const input = `<Grid xs={12} sm={6}>content</Grid>`;
    const result = transformGridSizeProps(input, 'test.tsx');
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('should not change Grid without breakpoint props', () => {
    const input = `<Grid container spacing={2}>content</Grid>`;
    const result = transformGridSizeProps(input, 'test.tsx');
    expect(result.changed).toBe(false);
  });

  it('should not change non-Grid elements with breakpoint-like attributes', () => {
    const input = `<Box xs={12}>content</Box>`;
    const result = transformGridSizeProps(input, 'test.tsx');
    expect(result.changed).toBe(false);
  });
});

// ─── removedApis (v8) ────────────────────────────────────────────────────────

describe('removedApis transformer (v8)', () => {
  it('should warn about indeterminateCheckboxAction', () => {
    const input = `<DataGrid indeterminateCheckboxAction="select" />`;
    const result = transformRemovedApis(input, 'test.tsx');
    expect(result.changed).toBe(false);
    expect(result.warnings.some(w => w.includes('indeterminateCheckboxAction'))).toBe(true);
  });

  it('should warn about rowPositionsDebounceMs', () => {
    const input = `<DataGrid rowPositionsDebounceMs={100} />`;
    const result = transformRemovedApis(input, 'test.tsx');
    expect(result.warnings.some(w => w.includes('rowPositionsDebounceMs'))).toBe(true);
  });

  it('should warn about resetPageOnSortFilter', () => {
    // The pattern requires `=` — use the explicit boolean form {true}
    const input = `<DataGrid resetPageOnSortFilter={true} />`;
    const result = transformRemovedApis(input, 'test.tsx');
    expect(result.warnings.some(w => w.includes('resetPageOnSortFilter'))).toBe(true);
  });

  it('should warn about legend prop on charts', () => {
    const input = `<BarChart legend={{ position: 'top' }} />`;
    const result = transformRemovedApis(input, 'test.tsx');
    expect(result.warnings.some(w => w.includes('legend'))).toBe(true);
  });

  it('should warn about disableEscapeKeyDown on Menu', () => {
    const input = `<Menu disableEscapeKeyDown={true} />`;
    const result = transformRemovedApis(input, 'test.tsx');
    expect(result.warnings.some(w => w.includes('disableEscapeKeyDown'))).toBe(true);
  });

  it('should warn about rowSelectionModel prop change', () => {
    const input = `<DataGrid rowSelectionModel={[1, 2, 3]} />`;
    const result = transformRemovedApis(input, 'test.tsx');
    expect(result.warnings.some(w => w.includes('rowSelectionModel'))).toBe(true);
  });

  it('should not warn when no removed APIs are used', () => {
    const input = `<DataGrid rows={rows} columns={columns} />`;
    const result = transformRemovedApis(input, 'test.tsx');
    expect(result.warnings.length).toBe(0);
  });

  it('should never modify source', () => {
    const input = `<DataGrid indeterminateCheckboxAction="select" />`;
    const result = transformRemovedApis(input, 'test.tsx');
    expect(result.source).toBe(input);
    expect(result.changed).toBe(false);
  });
});
