// Components renamed between MUI v4 and v5
// Key: v4 name, Value: { newName, newImportSource (optional) }
export const componentRenames = {
  // ExpansionPanel → Accordion
  ExpansionPanel: { newName: 'Accordion' },
  ExpansionPanelSummary: { newName: 'AccordionSummary' },
  ExpansionPanelDetails: { newName: 'AccordionDetails' },
  ExpansionPanelActions: { newName: 'AccordionActions' },

  // GridList → ImageList
  GridList: { newName: 'ImageList' },
  GridListTile: { newName: 'ImageListItem' },
  GridListTileBar: { newName: 'ImageListItemBar' },

  // RootRef removed (handled specially)
  // RootRef: { newName: null, removed: true },
};

// Props that also need renaming when component is renamed
export const componentPropRenames = {
  // GridList → ImageList prop changes
  ImageList: {
    spacing: 'gap',
    cellHeight: 'rowHeight',
  },
};

// Type/interface renames (for TypeScript files)
export const typeRenames = {
  ExpansionPanelProps: 'AccordionProps',
  ExpansionPanelSummaryProps: 'AccordionSummaryProps',
  ExpansionPanelDetailsProps: 'AccordionDetailsProps',
  ExpansionPanelActionsProps: 'AccordionActionsProps',
  GridListProps: 'ImageListProps',
  GridListTileProps: 'ImageListItemProps',
  GridListTileBarProps: 'ImageListItemBarProps',
};
