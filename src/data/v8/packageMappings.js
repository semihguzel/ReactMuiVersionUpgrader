/**
 * Package version targets for the MUI v7→v8 migration.
 *
 * Note: Material UI *core* skipped v8 and released v9.
 *       MUI X released v8. Both upgrades are bundled here under the
 *       'v7-to-v8' migration label for simplicity.
 */

// Core @mui/* packages → v9
// MUI X packages       → v8
export const v8PackageVersions = {
  // Core MUI → v9
  '@mui/material': '^9.0.0',
  '@mui/system': '^9.0.0',
  '@mui/lab': '^9.0.0',
  '@mui/icons-material': '^9.0.0',
  '@mui/utils': '^9.0.0',
  '@mui/styled-engine': '^9.0.0',
  '@mui/styled-engine-sc': '^9.0.0',
  '@mui/material-nextjs': '^9.0.0',

  // MUI X → v8
  '@mui/x-data-grid': '^8.0.0',
  '@mui/x-data-grid-pro': '^8.0.0',
  '@mui/x-data-grid-premium': '^8.0.0',
  '@mui/x-charts': '^8.0.0',
  '@mui/x-charts-pro': '^8.0.0',
  '@mui/x-date-pickers': '^8.0.0',
  '@mui/x-date-pickers-pro': '^8.0.0',
  '@mui/x-tree-view': '^8.0.0',
  '@mui/x-tree-view-pro': '^8.0.0',
};

/**
 * All @mui/* package names to detect when scanning a v7 project.
 * Any of these present in package.json signals a v7 codebase.
 */
export const v7PackageNamesForV8 = [
  // Core
  '@mui/material',
  '@mui/system',
  '@mui/lab',
  '@mui/icons-material',
  '@mui/utils',
  '@mui/styled-engine',
  '@mui/styled-engine-sc',
  '@mui/material-nextjs',
  // MUI X
  '@mui/x-data-grid',
  '@mui/x-data-grid-pro',
  '@mui/x-data-grid-premium',
  '@mui/x-charts',
  '@mui/x-charts-pro',
  '@mui/x-date-pickers',
  '@mui/x-date-pickers-pro',
  '@mui/x-tree-view',
  '@mui/x-tree-view-pro',
];

/**
 * MUI X pro/premium packages that require @mui/x-license to be added.
 */
export const v8LicenseRequiringPackages = [
  '@mui/x-data-grid-pro',
  '@mui/x-data-grid-premium',
  '@mui/x-charts-pro',
  '@mui/x-date-pickers-pro',
  '@mui/x-tree-view-pro',
];

/**
 * New package introduced in MUI X v8 for license management.
 */
export const v8LicensePackage = {
  name: '@mui/x-license',
  version: '^8.0.0',
};

export const v8PeerRequirements = {
  typescript: '>=5.0',
  react: '>=18.0',
};
