/**
 * Transformer: DataGrid selector / type / Tree View renames (MUI X v8)
 *
 * Renames:
 *   selectedGridRowsSelector      → gridRowSelectionIdsSelector
 *   selectedGridRowsCountSelector → gridRowSelectionCountSelector
 *   GridListColDef                → GridListViewColDef
 *   treeViewClasses               → simpleTreeViewClasses
 *   MuiTreeView                   → MuiSimpleTreeView
 */

import { v8DataGridIdentifierRenames, v8TreeViewRenames } from '../../../data/v8/propRenames.js';

const ALL_RENAMES = [...v8DataGridIdentifierRenames, ...v8TreeViewRenames];

export function transformSelectorRenames(source, filePath) {
  const changes = [];
  const warnings = [];
  let modified = source;
  let changed = false;

  for (const { from, to } of ALL_RENAMES) {
    const regex = new RegExp(`\\b${from}\\b`, 'g');
    if (regex.test(modified)) {
      modified = modified.replace(new RegExp(`\\b${from}\\b`, 'g'), to);
      changes.push({ type: 'identifier-rename', from, to });
      changed = true;
    }
  }

  return { source: modified, changed, changes, warnings };
}
