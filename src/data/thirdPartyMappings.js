// Third-party packages that depend on MUI and need version upgrades for v5 compatibility
// Structure:
// packageName: {
//   targetVersion: version range compatible with MUI v5,
//   notes: migration notes,
//   relatedPackages: { name: version } (packages that must be upgraded together),
//   importChanges: { oldImport: newImport } (if import paths changed)
// }

export const thirdPartyMappings = {
  // DevExpress Scheduler
  '@devexpress/dx-react-scheduler-material-ui': {
    targetVersion: '^4.0.8',
    notes: 'v4.x supports @mui/material v5. devextreme-reactive is now in maintenance mode.',
    relatedPackages: {
      '@devexpress/dx-react-core': '^4.0.8',
      '@devexpress/dx-react-scheduler': '^4.0.8',
    },
  },
  // DevExpress Grid
  '@devexpress/dx-react-grid-material-ui': {
    targetVersion: '^4.0.8',
    relatedPackages: {
      '@devexpress/dx-react-core': '^4.0.8',
      '@devexpress/dx-react-grid': '^4.0.8',
    },
  },
  // DevExpress Chart
  '@devexpress/dx-react-chart-material-ui': {
    targetVersion: '^4.0.8',
    relatedPackages: {
      '@devexpress/dx-react-core': '^4.0.8',
      '@devexpress/dx-react-chart': '^4.0.8',
    },
  },
  // notistack (snackbar library)
  notistack: {
    targetVersion: '^3.0.1',
    notes: 'v3.x supports MUI v5. API changes: SnackbarProvider props updated.',
    importChanges: {},
  },
  // material-table
  'material-table': {
    targetVersion: '^2.0.0',
    notes: 'Use @material-table/core for MUI v5 support.',
    replacedBy: '@material-table/core',
  },
  // mui-datatables
  'mui-datatables': {
    targetVersion: '^4.3.0',
    notes: 'v4.x supports MUI v5.',
  },
  // Material UI Pickers (already in packageMappings but third-party versions)
  '@material-ui/pickers': {
    targetVersion: null,
    notes: 'Replaced by @mui/x-date-pickers. Complete API rewrite needed.',
    replacedBy: '@mui/x-date-pickers',
    replacedVersion: '^6.0.0',
  },
  // React Admin
  'react-admin': {
    targetVersion: '^4.0.0',
    notes: 'v4.x supports MUI v5.',
  },
  // MUI X Date Pickers (if using old lab pickers)
  '@material-ui/lab': {
    // Already handled in packageMappings, but note for date picker components
    notes: 'Date/time picker components moved to @mui/x-date-pickers.',
  },
  // Formik Material UI
  'formik-material-ui': {
    targetVersion: '^4.0.0',
    notes: 'Renamed to formik-mui for MUI v5.',
    replacedBy: 'formik-mui',
    replacedVersion: '^5.0.0',
  },
  // Material UI Phone Number
  'material-ui-phone-number': {
    targetVersion: '^3.0.0',
    notes: 'v3.x supports MUI v5.',
  },
  // MUI X Data Grid (if using community version)
  '@material-ui/data-grid': {
    targetVersion: null,
    replacedBy: '@mui/x-data-grid',
    replacedVersion: '^6.0.0',
  },
};
