const renames = {
  ExpansionPanel: 'Accordion',
  ExpansionPanelSummary: 'AccordionSummary',
  ExpansionPanelDetails: 'AccordionDetails',
  ExpansionPanelActions: 'AccordionActions',
};

// Also type/prop renames
const typeRenames = {
  ExpansionPanelProps: 'AccordionProps',
  ExpansionPanelSummaryProps: 'AccordionSummaryProps',
  ExpansionPanelDetailsProps: 'AccordionDetailsProps',
  ExpansionPanelActionsProps: 'AccordionActionsProps',
};

/**
 * Renames ExpansionPanel components to Accordion.
 * Handles:
 *   - Import specifiers: import { ExpansionPanel } → import { Accordion }
 *   - JSX tags: <ExpansionPanel> → <Accordion>
 *   - Type references: ExpansionPanelProps → AccordionProps
 */
export function transformExpansionToAccordion(source, filePath) {
  let changed = false;
  const changes = [];
  let result = source;

  // Check if file contains any ExpansionPanel references
  const hasExpansion = Object.keys(renames).some(old => result.includes(old));
  if (!hasExpansion) return { source, changed: false, changes: [] };

  // Rename component names (import specifiers, JSX tags, variable refs)
  for (const [oldName, newName] of Object.entries(renames)) {
    // Match as whole word to avoid partial matches
    const pattern = new RegExp(`\\b${oldName}\\b`, 'g');
    if (pattern.test(result)) {
      result = result.replace(pattern, newName);
      changed = true;
      changes.push({
        type: 'component-rename',
        from: oldName,
        to: newName,
      });
    }
  }

  // Rename type names
  for (const [oldType, newType] of Object.entries(typeRenames)) {
    const pattern = new RegExp(`\\b${oldType}\\b`, 'g');
    if (pattern.test(result)) {
      result = result.replace(pattern, newType);
      changed = true;
      changes.push({
        type: 'type-rename',
        from: oldType,
        to: newType,
      });
    }
  }

  return { source: result, changed, changes };
}
