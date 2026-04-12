/**
 * Transformer: DataGrid hook renames (MUI X v8)
 *
 * Before:
 *   import { useGridApiEventHandler } from '@mui/x-data-grid';
 *   useGridApiEventHandler(apiRef, 'rowClick', handler);
 *
 * After:
 *   import { useGridEvent } from '@mui/x-data-grid';
 *   useGridEvent(apiRef, 'rowClick', handler);
 */

import { v8DataGridHookRenames } from '../../../data/v8/propRenames.js';

export function transformHookRenames(source, filePath) {
  const changes = [];
  const warnings = [];
  let modified = source;
  let changed = false;

  for (const { from, to } of v8DataGridHookRenames) {
    const regex = new RegExp(`\\b${from}\\b`, 'g');
    if (regex.test(modified)) {
      modified = modified.replace(new RegExp(`\\b${from}\\b`, 'g'), to);
      changes.push({ type: 'identifier-rename', from, to });
      changed = true;
    }
  }

  return { source: modified, changed, changes, warnings };
}
