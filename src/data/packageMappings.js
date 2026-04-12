// MUI v4 → v5 package name mappings
// Key: v4 package name, Value: v5 package name
export const packageMappings = {
  '@material-ui/core': '@mui/material',
  '@material-ui/system': '@mui/system',
  '@material-ui/unstyled': '@mui/base',
  '@material-ui/styles': '@mui/styles',
  '@material-ui/icons': '@mui/icons-material',
  '@material-ui/lab': '@mui/lab',
  '@material-ui/pickers': '@mui/x-date-pickers',
  '@material-ui/data-grid': '@mui/x-data-grid',
  '@material-ui/types': '@mui/types',
  '@material-ui/utils': '@mui/utils',
};

// Version mappings for new packages
export const packageVersions = {
  '@mui/material': '^5.15.0',
  '@mui/system': '^5.15.0',
  '@mui/base': '^5.0.0-beta.40',
  '@mui/styles': '^5.15.0',
  '@mui/icons-material': '^5.15.0',
  '@mui/lab': '^5.0.0-alpha.170',
  '@mui/x-date-pickers': '^6.0.0',
  '@mui/x-data-grid': '^6.0.0',
  '@mui/types': '^7.2.0',
  '@mui/utils': '^5.15.0',
};

// Required new dependencies
export const requiredDependencies = {
  '@emotion/react': '^11.11.0',
  '@emotion/styled': '^11.11.0',
};

// Deep import path mappings (submodule paths that changed)
export const deepImportMappings = {
  '@material-ui/core/styles': '@mui/material/styles',
  '@material-ui/core/colors': '@mui/material/colors',
  '@material-ui/core/utils': '@mui/utils',
  '@material-ui/core/test-utils': '@mui/material/test-utils',
};

// Exports that moved from @material-ui/core/styles to @mui/styles
export const stylesExports = [
  'makeStyles',
  'withStyles',
  'createStyles',
  'createGenerateClassName',
  'jssPreset',
  'ServerStyleSheets',
  'StylesProvider',
  'ThemeProvider',
  'withTheme',
  'useThemeVariants',
];

// Exports that should come from @mui/material/styles (not @mui/styles)
export const materialStylesExports = [
  'createTheme',
  'ThemeProvider',
  'styled',
  'useTheme',
  'alpha',
  'adaptV4Theme',
  'StyledEngineProvider',
  'responsiveFontSizes',
];
