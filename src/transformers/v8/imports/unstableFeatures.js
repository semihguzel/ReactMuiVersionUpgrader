/**
 * Transformer: DataGrid unstable_* → stable feature names (MUI X v8)
 *
 * Several DataGrid props and apiRef methods that were prefixed with
 * `unstable_` in v7 are now promoted to stable (no prefix) in v8.
 *
 * Before:
 *   <DataGrid unstable_rowSpanning … />
 *   apiRef.current.unstable_dataSource.fetchRows(…)
 *
 * After:
 *   <DataGrid rowSpanning … />
 *   apiRef.current.dataSource.fetchRows(…)
 */

import { v8DataGridUnstableRenames } from '../../../data/v8/propRenames.js';

export function transformUnstableFeatures(source, filePath) {
  const changes = [];
  const warnings = [];
  let modified = source;
  let changed = false;

  for (const { from, to } of v8DataGridUnstableRenames) {
    const regex = new RegExp(`\\b${from}\\b`, 'g');
    if (regex.test(modified)) {
      modified = modified.replace(new RegExp(`\\b${from}\\b`, 'g'), to);
      changes.push({ type: 'prop-rename', from, to });
      changed = true;
    }
  }

  return { source: modified, changed, changes, warnings };
}
