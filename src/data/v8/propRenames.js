/**
 * Breaking API changes for the MUI v7→v8 / MUI X v7→v8 migration.
 */

// ─── DataGrid: unstable_* props/methods promoted to stable ────────────────────
export const v8DataGridUnstableRenames = [
  { from: 'unstable_rowSpanning',                     to: 'rowSpanning' },
  { from: 'unstable_dataSource',                      to: 'dataSource' },
  { from: 'unstable_dataSourceCache',                 to: 'dataSourceCache' },
  { from: 'unstable_lazyLoading',                     to: 'lazyLoading' },
  { from: 'unstable_lazyLoadingRequestThrottleMs',    to: 'lazyLoadingRequestThrottleMs' },
  { from: 'unstable_onDataSourceError',               to: 'onDataSourceError' },
  { from: 'unstable_listView',                        to: 'listView' },
  { from: 'unstable_listColumn',                      to: 'listViewColumn' },
];

// ─── DataGrid: hook renames ───────────────────────────────────────────────────
export const v8DataGridHookRenames = [
  { from: 'useGridApiEventHandler', to: 'useGridEvent' },
  { from: 'useGridApiOptionHandler', to: 'useGridEventPriority' },
];

// ─── DataGrid: selector / type renames ───────────────────────────────────────
export const v8DataGridIdentifierRenames = [
  { from: 'selectedGridRowsSelector',      to: 'gridRowSelectionIdsSelector' },
  { from: 'selectedGridRowsCountSelector', to: 'gridRowSelectionCountSelector' },
  { from: 'GridListColDef',                to: 'GridListViewColDef' },
];

// ─── Tree View: class/theme-key renames ──────────────────────────────────────
export const v8TreeViewRenames = [
  { from: 'treeViewClasses',  to: 'simpleTreeViewClasses' },
  { from: 'MuiTreeView',      to: 'MuiSimpleTreeView' },
];

// ─── Grid: breakpoint props → size prop ──────────────────────────────────────
// The breakpoint keys consumed by gridSizeProps transformer.
export const v8GridBreakpointProps = ['xs', 'sm', 'md', 'lg', 'xl'];

// ─── Icons: legacy "Outline" (without 'd') renames ───────────────────────────
export const v8LegacyOutlineIconRenames = [
  'AcUnitOutline',
  'AccessAlarmOutline',
  'AccessAlarmsOutline',
  'AccessibilityOutline',
  'AccessibleOutline',
  'AccountBoxOutline',
  'AccountCircleOutline',
  'AdbOutline',
  'AddAPhotoOutline',
  'AddAlarmOutline',
  'AddAlertOutline',
  'AddBoxOutline',
  'AddCircleOutline',   // keep — this one already has a canonical v5 name
  'AddCommentOutline',
  'AddIcCallOutline',
  'AddLocationOutline',
  'AddPhotoAlternateOutline',
  'AddShoppingCartOutline',
  'AddToHomeScreenOutline',
  'AddToPhotosOutline',
  'AddToQueueOutline',
  'AirlineSeatFlatAngledOutline',
  'AirlineSeatFlatOutline',
  'InfoOutline',
  'HomeOutline',
  'SettingsOutline',
];

// ─── Removed APIs (warn-only, no automated fix) ───────────────────────────────
export const v8RemovedAPIs = [
  {
    component: 'DataGrid',
    prop: 'indeterminateCheckboxAction',
    pattern: /\bindeterminateCheckboxAction\s*=/,
    message:
      'The `indeterminateCheckboxAction` prop was removed from DataGrid in MUI X v8. ' +
      'See: https://mui.com/x/migration/migration-data-grid-v7/',
    docsUrl: 'https://mui.com/x/migration/migration-data-grid-v7/',
  },
  {
    component: 'DataGrid',
    prop: 'rowPositionsDebounceMs',
    pattern: /\browPositionsDebounceMs\s*=/,
    message:
      'The `rowPositionsDebounceMs` prop was removed from DataGrid in MUI X v8. ' +
      'See: https://mui.com/x/migration/migration-data-grid-v7/',
    docsUrl: 'https://mui.com/x/migration/migration-data-grid-v7/',
  },
  {
    component: 'DataGrid',
    prop: 'resetPageOnSortFilter',
    pattern: /\bresetPageOnSortFilter\s*=/,
    message:
      'The `resetPageOnSortFilter` prop was removed from DataGrid in MUI X v8. ' +
      'The grid now automatically resets to the first page on sort/filter. ' +
      'See: https://mui.com/x/migration/migration-data-grid-v7/',
    docsUrl: 'https://mui.com/x/migration/migration-data-grid-v7/',
  },
  {
    component: 'DataGrid',
    prop: 'showToolbar',
    pattern: /\bshowToolbar\b/,
    message:
      'The `showToolbar` prop is now required to display the DataGrid toolbar in MUI X v8. ' +
      'Add `showToolbar` to your DataGrid to keep the toolbar visible. ' +
      'See: https://mui.com/x/migration/migration-data-grid-v7/',
    docsUrl: 'https://mui.com/x/migration/migration-data-grid-v7/',
  },
  {
    component: 'DataGrid',
    prop: 'rowSelectionModel',
    pattern: /\browSelectionModel\s*=/,
    message:
      'The `rowSelectionModel` prop type changed in MUI X v8: it is now an object ' +
      '{ type: "include" | "exclude"; ids: Set<GridRowId> } instead of an array. ' +
      'Update your state accordingly. See: https://mui.com/x/migration/migration-data-grid-v7/',
    docsUrl: 'https://mui.com/x/migration/migration-data-grid-v7/',
  },
  {
    component: 'DataGrid',
    prop: 'GridSaveAltIcon',
    pattern: /\bGridSaveAltIcon\b/,
    message:
      '`GridSaveAltIcon` was removed from MUI X v8. ' +
      'Import `SaveAlt` from `@mui/icons-material` instead. ' +
      'See: https://mui.com/x/migration/migration-data-grid-v7/',
    docsUrl: 'https://mui.com/x/migration/migration-data-grid-v7/',
  },
  {
    component: 'DataGrid',
    prop: 'apiRef.current.resize',
    pattern: /apiRef\.current\.resize\s*\(/,
    message:
      '`apiRef.current.resize()` was removed in MUI X v8. ' +
      'See: https://mui.com/x/migration/migration-data-grid-v7/',
    docsUrl: 'https://mui.com/x/migration/migration-data-grid-v7/',
  },
  {
    component: 'DataGrid',
    prop: 'apiRef.current.forceUpdate',
    pattern: /apiRef\.current\.forceUpdate\s*\(/,
    message:
      '`apiRef.current.forceUpdate()` was removed in MUI X v8. ' +
      'Use `useGridSelector()` for reactive updates instead. ' +
      'See: https://mui.com/x/migration/migration-data-grid-v7/',
    docsUrl: 'https://mui.com/x/migration/migration-data-grid-v7/',
  },
  {
    component: 'Charts',
    prop: 'legend',
    pattern: /\blegend\s*=\s*[{'"]/,
    message:
      'The `legend` prop was removed from chart components in MUI X v8. ' +
      'Use `slotProps={{ legend: { ... } }}` instead. ' +
      'See: https://mui.com/x/migration/migration-charts-v7/',
    docsUrl: 'https://mui.com/x/migration/migration-charts-v7/',
  },
  {
    component: 'Menu',
    prop: 'disableEscapeKeyDown',
    pattern: /\bdisableEscapeKeyDown\s*=/,
    message:
      'The `disableEscapeKeyDown` prop was removed from Menu in Material UI v9. ' +
      'See: https://mui.com/material-ui/migration/upgrade-to-v9/',
    docsUrl: 'https://mui.com/material-ui/migration/upgrade-to-v9/',
  },
];
