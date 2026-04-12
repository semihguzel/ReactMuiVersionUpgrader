/**
 * MUI v5 → v6 component renames.
 * Unstable_Grid2 was stabilised and renamed to Grid2.
 */
export const v6ComponentRenames = {
  Unstable_Grid2: 'Grid2',
};

/**
 * Props removed from Grid2 in v6.
 */
export const v6Grid2RemovedProps = ['disableEqualOverflow'];

/**
 * Props removed from ListItem in v6 (moved to ListItemButton).
 */
export const v6ListItemRemovedProps = ['button', 'autoFocus', 'disabled', 'selected'];

/**
 * Components whose `components` / `componentsProps` props were migrated to
 * `slots` / `slotProps` in v6. The value lists any additionally-renamed named
 * props that should be coalesced into slotProps.
 */
export const v6SlotComponents = {
  Modal: {
    namedSlotProps: { BackdropProps: 'backdrop' },
    namedSlots: { TransitionComponent: 'transition' },
    namedSlotPropsFromSlots: { TransitionProps: 'transition' },
  },
  Backdrop: {
    namedSlots: { TransitionComponent: 'transition' },
    namedSlotPropsFromSlots: { TransitionProps: 'transition' },
  },
  Popover: {
    namedSlotProps: { BackdropProps: 'backdrop' },
    namedSlots: { TransitionComponent: 'transition' },
    namedSlotPropsFromSlots: { TransitionProps: 'transition' },
  },
  Tooltip: {
    namedSlots: { TransitionComponent: 'transition' },
    namedSlotPropsFromSlots: { TransitionProps: 'transition' },
  },
  Menu: {
    namedSlotPropsFromSlots: { TransitionProps: 'transition' },
  },
};
