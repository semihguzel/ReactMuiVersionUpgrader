/**
 * Transformer: StyledEngineProvider import source migration for MUI v7.
 *
 * In v7, StyledEngineProvider must be imported from '@mui/material/styles'
 * rather than the '@mui/material' barrel.
 *
 * Before: import { Button, StyledEngineProvider } from '@mui/material';
 * After:  import { Button } from '@mui/material';
 *         import { StyledEngineProvider } from '@mui/material/styles';
 *
 * No-op if StyledEngineProvider is already imported from '@mui/material/styles'.
 */
export function transformStyledEngineProvider(source, filePath) {
  const changes = [];
  const warnings = [];
  let modified = source;
  let changed = false;

  // Skip if StyledEngineProvider not present at all
  if (!modified.includes('StyledEngineProvider')) {
    return { source: modified, changed, changes, warnings };
  }

  // Skip if already imported from the correct path
  if (/from\s+['"]@mui\/material\/styles['"]/.test(modified) &&
      modified.includes('StyledEngineProvider')) {
    // Check if it's already in the styles import specifically
    const stylesImportRegex = /import\s+\{[^}]*StyledEngineProvider[^}]*\}\s+from\s+['"]@mui\/material\/styles['"]/;
    if (stylesImportRegex.test(modified)) {
      return { source: modified, changed, changes, warnings };
    }
  }

  // Match: import { ..., StyledEngineProvider, ... } from '@mui/material'
  // (barrel import only — not from a sub-path)
  const barrelImportRegex = /^(import\s+\{)([^}]*)\}\s+from\s+(['"])@mui\/material\3\s*;?/m;
  const match = modified.match(barrelImportRegex);

  if (!match) {
    return { source: modified, changed, changes, warnings };
  }

  const [fullMatch, importStart, specifiers] = match;

  if (!specifiers.includes('StyledEngineProvider')) {
    return { source: modified, changed, changes, warnings };
  }

  // Remove StyledEngineProvider from the barrel import specifiers
  const cleanedSpecifiers = specifiers
    .split(',')
    .map(s => s.trim())
    .filter(s => s !== '' && s !== 'StyledEngineProvider')
    .join(', ');

  let newBarrelImport;
  if (cleanedSpecifiers.length > 0) {
    newBarrelImport = `${importStart} ${cleanedSpecifiers} } from '@mui/material';`;
  } else {
    // All specifiers were StyledEngineProvider — remove the entire import line
    newBarrelImport = '';
  }

  const newStylesImport = `import { StyledEngineProvider } from '@mui/material/styles';`;

  modified = modified.replace(fullMatch, [newBarrelImport, newStylesImport].filter(Boolean).join('\n'));

  changes.push({
    type: 'import-source-change',
    exportName: 'StyledEngineProvider',
    from: '@mui/material',
    to: '@mui/material/styles',
  });
  changed = true;

  return { source: modified, changed, changes, warnings };
}
