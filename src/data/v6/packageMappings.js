/**
 * MUI v5 → v6 package version targets.
 * Package names stay the same; only versions change.
 * Exception: @mui/x-data-grid jumps to v7 alongside v6 core.
 */
export const v6PackageVersions = {
  '@mui/material': '^6.0.0',
  '@mui/system': '^6.0.0',
  '@mui/lab': '^6.0.0',
  '@mui/icons-material': '^6.0.0',
  '@mui/styles': '^6.0.0',
  '@mui/utils': '^6.0.0',
  '@mui/base': '^6.0.0',
  // X packages move to their own major alongside v6 core
  '@mui/x-data-grid': '^7.0.0',
  '@mui/x-data-grid-pro': '^7.0.0',
  '@mui/x-data-grid-premium': '^7.0.0',
  '@mui/x-date-pickers': '^7.0.0',
  '@mui/x-date-pickers-pro': '^7.0.0',
};

/**
 * All v5 packages to scan for in package.json.
 */
export const v5PackageNames = [
  '@mui/material',
  '@mui/system',
  '@mui/lab',
  '@mui/icons-material',
  '@mui/styles',
  '@mui/utils',
  '@mui/base',
  '@mui/x-data-grid',
  '@mui/x-data-grid-pro',
  '@mui/x-data-grid-premium',
  '@mui/x-date-pickers',
  '@mui/x-date-pickers-pro',
];

/**
 * Peer/dev dependency version requirements for v6.
 */
export const v6PeerRequirements = {
  typescript: '>=4.7',
};
