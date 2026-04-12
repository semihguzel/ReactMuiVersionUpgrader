/**
 * MUI v5 → v6 prop-level changes, keyed by component name.
 *
 * Shape per entry:
 *   renameTo: string | null       — simple prop rename (null = not a simple rename)
 *   removed: true                  — prop was removed; migration hint in `migration`
 *   migration: string              — human-readable guidance for removed/complex props
 *   slotsMigration: { slot }       — prop moves into `slots.X`
 *   slotPropsMigration: { slot }   — prop moves into `slotProps.X`
 */
export const v6PropRenames = {
  Accordion: {
    TransitionComponent: {
      renameTo: null,
      slotsMigration: { slot: 'transition' },
      migration: 'Replace TransitionComponent with slots={{ transition: YourComponent }}',
    },
    TransitionProps: {
      renameTo: null,
      slotPropsMigration: { slot: 'transition' },
      migration: 'Replace TransitionProps with slotProps={{ transition: { ...yourProps } }}',
    },
  },
  ListItemText: {
    primaryTypographyProps: {
      renameTo: null,
      slotPropsMigration: { slot: 'primary' },
      migration: 'Replace primaryTypographyProps with slotProps={{ primary: yourProps }}',
    },
    secondaryTypographyProps: {
      renameTo: null,
      slotPropsMigration: { slot: 'secondary' },
      migration: 'Replace secondaryTypographyProps with slotProps={{ secondary: yourProps }}',
    },
  },
  ListItem: {
    button: {
      removed: true,
      migration:
        'Replace <ListItem button> with <ListItemButton>. Import ListItemButton from @mui/material.',
    },
    autoFocus: {
      removed: true,
      migration: 'Move autoFocus to <ListItemButton autoFocus>.',
    },
    disabled: {
      removed: true,
      migration: 'Move disabled to <ListItemButton disabled>.',
    },
    selected: {
      removed: true,
      migration: 'Move selected to <ListItemButton selected>.',
    },
  },
  Modal: {
    components: { renameTo: 'slots' },
    componentsProps: { renameTo: 'slotProps' },
    BackdropProps: {
      renameTo: null,
      slotPropsMigration: { slot: 'backdrop' },
      migration: 'Replace BackdropProps with slotProps={{ backdrop: yourProps }}',
    },
    TransitionComponent: {
      renameTo: null,
      slotsMigration: { slot: 'transition' },
      migration: 'Replace TransitionComponent with slots={{ transition: YourComponent }}',
    },
    TransitionProps: {
      renameTo: null,
      slotPropsMigration: { slot: 'transition' },
      migration: 'Replace TransitionProps with slotProps={{ transition: yourProps }}',
    },
  },
  Backdrop: {
    components: { renameTo: 'slots' },
    componentsProps: { renameTo: 'slotProps' },
    TransitionComponent: {
      renameTo: null,
      slotsMigration: { slot: 'transition' },
      migration: 'Replace TransitionComponent with slots={{ transition: YourComponent }}',
    },
    TransitionProps: {
      renameTo: null,
      slotPropsMigration: { slot: 'transition' },
      migration: 'Replace TransitionProps with slotProps={{ transition: yourProps }}',
    },
  },
  Popover: {
    components: { renameTo: 'slots' },
    componentsProps: { renameTo: 'slotProps' },
    BackdropProps: {
      renameTo: null,
      slotPropsMigration: { slot: 'backdrop' },
      migration: 'Replace BackdropProps with slotProps={{ backdrop: yourProps }}',
    },
    TransitionComponent: {
      renameTo: null,
      slotsMigration: { slot: 'transition' },
      migration: 'Replace TransitionComponent with slots={{ transition: YourComponent }}',
    },
    TransitionProps: {
      renameTo: null,
      slotPropsMigration: { slot: 'transition' },
      migration: 'Replace TransitionProps with slotProps={{ transition: yourProps }}',
    },
  },
  Tooltip: {
    components: { renameTo: 'slots' },
    componentsProps: { renameTo: 'slotProps' },
    TransitionComponent: {
      renameTo: null,
      slotsMigration: { slot: 'transition' },
      migration: 'Replace TransitionComponent with slots={{ transition: YourComponent }}',
    },
    TransitionProps: {
      renameTo: null,
      slotPropsMigration: { slot: 'transition' },
      migration: 'Replace TransitionProps with slotProps={{ transition: yourProps }}',
    },
  },
  Menu: {
    TransitionProps: {
      renameTo: null,
      slotPropsMigration: { slot: 'transition' },
      migration: 'Replace TransitionProps with slotProps={{ transition: yourProps }}',
    },
  },
};

/**
 * System props that are deprecated on these components in v6.
 * They should be moved to the `sx` prop.
 */
export const v6SystemPropComponents = ['Box', 'Typography', 'Link', 'Grid', 'Stack'];

export const v6SystemProps = [
  'mt', 'mb', 'ml', 'mr', 'mx', 'my',
  'pt', 'pb', 'pl', 'pr', 'px', 'py',
  'p', 'm',
  'top', 'left', 'right', 'bottom',
  'width', 'height', 'minWidth', 'maxWidth', 'minHeight', 'maxHeight',
  'display', 'overflow', 'position', 'zIndex',
  'flexDirection', 'flexWrap', 'alignItems', 'justifyContent',
  'flexGrow', 'flexShrink', 'flex', 'gap',
  'color', 'bgcolor',
  'borderRadius', 'border', 'borderColor', 'boxShadow',
  'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'textAlign',
];
