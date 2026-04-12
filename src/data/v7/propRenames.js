/**
 * MUI v6 → v7 prop and API changes.
 */

/**
 * InputLabel (and related) size prop value rename.
 * `size="normal"` → `size="medium"` on these components.
 */
export const v7InputLabelSizeProp = {
  components: ['InputLabel', 'Button', 'TextField'],
  from: 'normal',
  to: 'medium',
};

/**
 * Removed APIs that have no safe automated fix.
 * Transformers emit warnings for these so users can fix manually.
 */
export const v7RemovedAPIs = [
  {
    component: 'Modal/Dialog',
    prop: 'onBackdropClick',
    pattern: /\bonBackdropClick\s*=/,
    message:
      'The `onBackdropClick` prop was removed from Modal and Dialog in MUI v7. ' +
      'Use the `onClose` callback and check the `reason` parameter instead ' +
      '(reason === "backdropClick").',
    docsUrl: 'https://mui.com/material-ui/migration/upgrade-to-v7/',
  },
  {
    component: 'styles',
    prop: 'experimentalStyled',
    pattern: /\bexperimentalStyled\b/,
    message:
      '`experimentalStyled` was removed in MUI v7. Replace all usages with `styled` ' +
      'imported from `@mui/material/styles`.',
    docsUrl: 'https://mui.com/material-ui/migration/upgrade-to-v7/',
  },
  {
    component: 'Hidden',
    prop: null,
    pattern: /<Hidden[\s/>]/,
    message:
      'The `Hidden` component was completely removed in MUI v7. ' +
      'There is no automated replacement — refactor using `sx` prop breakpoints, ' +
      '`useMediaQuery`, or CSS media queries.',
    docsUrl: 'https://mui.com/material-ui/migration/upgrade-to-v7/',
  },
  {
    component: 'PigmentHidden',
    prop: null,
    pattern: /<PigmentHidden[\s/>]/,
    message:
      'The `PigmentHidden` component was removed in MUI v7. ' +
      'Refactor using `sx` prop breakpoints, `useMediaQuery`, or CSS media queries.',
    docsUrl: 'https://mui.com/material-ui/migration/upgrade-to-v7/',
  },
  {
    component: 'Rating',
    prop: 'MuiRating-readOnly CSS class',
    pattern: /MuiRating-readOnly/,
    message:
      'The CSS class `MuiRating-readOnly` was removed in MUI v7. ' +
      'Use `Mui-readOnly` instead.',
    docsUrl: 'https://mui.com/material-ui/migration/upgrade-to-v7/',
  },
  {
    component: 'Stepper',
    prop: 'StepButtonIcon type',
    pattern: /\bStepButtonIcon\b/,
    message:
      'The `StepButtonIcon` TypeScript type was removed in MUI v7. ' +
      'Use `StepButtonProps[\'icon\']` instead.',
    docsUrl: 'https://mui.com/material-ui/migration/upgrade-to-v7/',
  },
];

/**
 * Deep import path renames (more than one level deep no longer work in v7).
 */
export const v7DeepImportRenames = {
  '@mui/material/styles/createTheme': '@mui/material/styles',
  '@mui/material/TablePagination/TablePaginationActions': '@mui/material/TablePaginationActions',
};

/**
 * StyledEngineProvider moved from @mui/material barrel to @mui/material/styles.
 */
export const v7StyledEngineProviderMove = {
  from: '@mui/material',
  to: '@mui/material/styles',
  exportName: 'StyledEngineProvider',
};
