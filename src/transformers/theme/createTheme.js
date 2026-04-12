/**
 * Renames createMuiTheme → createTheme
 * Also updates the import statement.
 *
 * v4: import { createMuiTheme } from '@material-ui/core/styles'
 *     const theme = createMuiTheme({...})
 *
 * v5: import { createTheme } from '@mui/material/styles'
 *     const theme = createTheme({...})
 */
export function transformCreateTheme(source, filePath) {
  let changed = false;
  const changes = [];
  let result = source;

  if (!result.includes('createMuiTheme')) {
    return { source, changed: false, changes: [] };
  }

  // Replace all occurrences of createMuiTheme with createTheme
  const pattern = /\bcreateMuiTheme\b/g;
  result = result.replace(pattern, 'createTheme');

  if (result !== source) {
    changed = true;
    changes.push({
      type: 'function-rename',
      from: 'createMuiTheme',
      to: 'createTheme',
    });
  }

  return { source: result, changed, changes };
}
