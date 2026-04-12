/**
 * MUI v6 → v7 package version targets.
 * Package names stay the same; only versions change.
 * MUI X packages are NOT bumped here — they follow their own versioning.
 */
export const v7PackageVersions = {
  '@mui/material':        '^7.0.0',
  '@mui/system':          '^7.0.0',
  '@mui/lab':             '^7.0.0',
  '@mui/icons-material':  '^7.0.0',
  '@mui/utils':           '^7.0.0',
  '@mui/styled-engine':   '^7.0.0',
  '@mui/styled-engine-sc': '^7.0.0',
  '@mui/material-nextjs': '^7.0.0',
};

/**
 * All v6 packages to scan for in package.json.
 * Includes MUI X packages so they can be detected but NOT bumped
 * (they maintain independent versioning — leave versions as-is).
 */
export const v6PackageNamesForV7 = [
  '@mui/material',
  '@mui/system',
  '@mui/lab',
  '@mui/icons-material',
  '@mui/utils',
  '@mui/styled-engine',
  '@mui/styled-engine-sc',
  '@mui/material-nextjs',
  // X packages — detected for reporting but not bumped
  '@mui/x-data-grid',
  '@mui/x-data-grid-pro',
  '@mui/x-data-grid-premium',
  '@mui/x-date-pickers',
  '@mui/x-date-pickers-pro',
];

/**
 * Peer/dev dependency version requirements for v7.
 */
export const v7PeerRequirements = {
  typescript: '>=4.9',
};
