// Prop renames and value changes per component
// Structure:
// ComponentName: {
//   propName: {
//     renameTo: 'newPropName' (if prop name changed),
//     valueChanges: { oldValue: newValue } (if prop values changed)
//   }
// }
export const propRenames = {
  Avatar: {
    variant: {
      valueChanges: { circle: 'circular', square: 'square' },
    },
  },
  Badge: {
    overlap: {
      valueChanges: { circle: 'circular', rectangle: 'rectangular' },
    },
    anchorOrigin: {
      // horizontal value "left"/"right" unchanged, vertical value unchanged
    },
  },
  Skeleton: {
    variant: {
      valueChanges: { circle: 'circular', rect: 'rectangular' },
    },
  },
  CircularProgress: {
    variant: {
      valueChanges: { static: 'determinate' },
    },
  },
  Chip: {
    variant: {
      valueChanges: { default: 'filled' },
    },
  },
  Fab: {
    variant: {
      valueChanges: { round: 'circular' },
    },
  },
  Grid: {
    justify: {
      renameTo: 'justifyContent',
    },
    alignItems: {},
    alignContent: {},
  },
  Collapse: {
    collapsedHeight: {
      renameTo: 'collapsedSize',
    },
  },
  Dialog: {
    disableBackdropClick: {
      removed: true,
      migration: 'Handle in onClose: if (reason !== "backdropClick") onClose()',
    },
    onEscapeKeyDown: {
      removed: true,
      migration: 'Handle in onClose: if (reason === "escapeKeyDown") handler()',
    },
  },
  Modal: {
    disableBackdropClick: {
      removed: true,
      migration: 'Handle in onClose: if (reason !== "backdropClick") onClose()',
    },
    onEscapeKeyDown: {
      removed: true,
      migration: 'Handle in onClose reason check',
    },
    onRendered: {
      removed: true,
      migration: 'Use ref callback or useEffect',
    },
  },
  TablePagination: {
    onChangePage: {
      renameTo: 'onPageChange',
    },
    onChangeRowsPerPage: {
      renameTo: 'onRowsPerPageChange',
    },
    backIconButtonText: {
      removed: true,
      migration: 'Use getItemAriaLabel prop',
    },
    nextIconButtonText: {
      removed: true,
      migration: 'Use getItemAriaLabel prop',
    },
    labelDisplayedRows: {},
  },
  TextareaAutosize: {
    rows: {
      renameTo: 'minRows',
    },
    rowsMax: {
      renameTo: 'maxRows',
    },
    rowsMin: {
      renameTo: 'minRows',
    },
  },
  TextField: {
    rowsMax: {
      renameTo: 'maxRows',
    },
    rows: {
      // Only rename when multiline; handled specially
    },
  },
  Autocomplete: {
    closeIcon: {
      renameTo: 'clearIcon',
    },
    getOptionSelected: {
      renameTo: 'isOptionEqualToValue',
    },
    debug: {
      removed: true,
      migration: 'Debug prop removed; use open prop for similar behavior',
    },
  },
  Button: {
    color: {
      valueChanges: { default: 'inherit' },
    },
  },
  IconButton: {
    // size changes handled by default
  },
  Icon: {
    fontSize: {
      valueChanges: { default: 'medium' },
    },
  },
  SvgIcon: {
    fontSize: {
      valueChanges: { default: 'medium' },
    },
  },
  Table: {
    padding: {
      valueChanges: { default: 'normal' },
    },
  },
  Tabs: {
    indicatorColor: {
      valueChanges: { secondary: 'primary' },
    },
    textColor: {
      valueChanges: { inherit: 'primary' },
    },
  },
  Slider: {
    ValueLabelComponent: {
      removed: true,
      migration: 'Use components={{ ValueLabel: CustomComponent }} or slots',
    },
    ThumbComponent: {
      removed: true,
      migration: 'Use components={{ Thumb: CustomComponent }} or slots',
    },
  },
  Snackbar: {
    // Transition props moved to TransitionProps
  },
  OutlinedInput: {
    labelWidth: {
      removed: true,
      migration: 'Use label prop instead of labelWidth',
    },
  },
  Select: {
    labelWidth: {
      removed: true,
      migration: 'Use label prop instead',
    },
  },
  Pagination: {
    variant: {
      valueChanges: { round: 'circular' },
    },
  },
  PaginationItem: {
    variant: {
      valueChanges: { round: 'circular' },
    },
  },
};

// Transition props that moved to TransitionProps object in v5
// Applies to: Dialog, Menu, Popover, Snackbar, Tooltip
export const transitionPropsMigration = {
  components: ['Dialog', 'Menu', 'Popover', 'Snackbar', 'Tooltip'],
  props: [
    'onEnter',
    'onEntering',
    'onEntered',
    'onExit',
    'onExiting',
    'onExited',
  ],
};
