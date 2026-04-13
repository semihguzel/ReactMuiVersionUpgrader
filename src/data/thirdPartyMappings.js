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
    peerRequirements: {
      '@mui/x-date-pickers': '^5.0.15',
    },
    peerRequirementNotes:
      '@devexpress/dx-react-scheduler-material-ui@4.x requires @mui/x-date-pickers@^5. ' +
      'Pinned to ^5.0.15 to satisfy this peer dependency. ' +
      'If you need @mui/x-date-pickers@^6+, use --legacy-peer-deps or replace the DevExpress scheduler.',
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
    notes: 'Renamed to formik-mui for MUI v5. Latest stable is 4.0.0 (v5.x is alpha-only and not published as a stable release).',
    replacedBy: 'formik-mui',
    replacedVersion: '^4.0.0',
  },
  // Formik Material UI Pickers (no stable v5-compatible replacement exists)
  'formik-material-ui-pickers': {
    targetVersion: null,
    notes: 'No stable MUI v5-compatible release exists. Consider migrating to @mui/x-date-pickers directly. Manual migration required.',
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

  // @unicef/material-ui-currency-textfield — abandoned, no MUI v5 release
  '@unicef/material-ui-currency-textfield': {
    targetVersion: null,
    notes:
      'Abandoned package. No MUI v5-compatible release exists. ' +
      'Replace with react-number-format (already available) combined with a standard MUI TextField.',
  },

  // material-ui-chip-input — abandoned, replaced by mui-chips-input
  'material-ui-chip-input': {
    targetVersion: null,
    notes:
      'Abandoned. Replaced by mui-chips-input for MUI v5. ' +
      'API is similar but not identical — review the mui-chips-input docs.',
    replacedBy: 'mui-chips-input',
    replacedVersion: '^2.0.0',
    // mui-chips-input has no default export; the component is named MuiChipsInput.
    // Default imports are rewritten to a named import with an alias so the rest
    // of the file keeps working without further changes:
    //   import ChipInput from 'material-ui-chip-input'
    //   → import { MuiChipsInput as ChipInput } from 'mui-chips-input'
    defaultToNamed: 'MuiChipsInput',
  },

  // material-ui-confirm — v3+ supports MUI v5
  'material-ui-confirm': {
    targetVersion: '^3.0.0',
    notes:
      'v3+ supports MUI v5. Minor API changes: ConfirmProvider and useConfirm interface updated.',
  },

  // material-ui-image — replaced by mui-image
  'material-ui-image': {
    targetVersion: null,
    notes:
      'No MUI v5-compatible release. Replace with mui-image which has a compatible API.',
    replacedBy: 'mui-image',
    replacedVersion: '^1.0.0',
  },

  // material-ui-popup-state — v5+ supports MUI v5
  'material-ui-popup-state': {
    targetVersion: '^5.0.0',
    notes: 'v5.0.0+ supports MUI v5 (@mui/material peer dependency). Ensure you are on v5+.',
  },

  // reactour — v2.x removed MUI dependency entirely
  reactour: {
    targetVersion: '^2.0.0',
    notes:
      'v2.x removed the MUI dependency entirely. ' +
      'Review breaking API changes in the reactour v2 migration guide before upgrading.',
  },
};
