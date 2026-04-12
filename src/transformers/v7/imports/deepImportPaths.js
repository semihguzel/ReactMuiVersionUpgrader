import { v7DeepImportRenames } from '../../../data/v7/propRenames.js';

/**
 * Transformer: Fix deep (multi-level) import paths removed in MUI v7.
 *
 * MUI v7 no longer supports more than one level of deep imports.
 * This transformer auto-fixes the two documented cases:
 *   - '@mui/material/styles/createTheme'                    → '@mui/material/styles'
 *   - '@mui/material/TablePagination/TablePaginationActions' → '@mui/material/TablePaginationActions'
 */
export function transformDeepImportPaths(source, filePath) {
  const changes = [];
  const warnings = [];
  let modified = source;
  let changed = false;

  for (const [oldPath, newPath] of Object.entries(v7DeepImportRenames)) {
    // Match the path inside single or double quotes in import/require statements
    const regex = new RegExp(`(['"])${escapeRegex(oldPath)}\\1`, 'g');
    if (regex.test(modified)) {
      modified = modified.replace(
        new RegExp(`(['"])${escapeRegex(oldPath)}\\1`, 'g'),
        (_, q) => `${q}${newPath}${q}`
      );
      changes.push({ type: 'import-path-rename', from: oldPath, to: newPath });
      changed = true;
    }
  }

  return { source: modified, changed, changes, warnings };
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
