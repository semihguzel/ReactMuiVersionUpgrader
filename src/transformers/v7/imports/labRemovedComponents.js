/**
 * Transformer: Warn about @mui/lab imports in MUI v7 (warn-only).
 *
 * Several components that were previously in @mui/lab have been removed
 * from the lab package in v7 (they were moved to @mui/material in earlier versions).
 * This transformer detects any remaining @mui/lab imports and advises the user
 * to run the official codemod.
 *
 * Always returns changed: false — this is a warning-only transformer.
 */
export function transformLabRemovedComponents(source, filePath) {
  const warnings = [];

  if (!source.includes('@mui/lab')) {
    return { source, changed: false, changes: [], warnings };
  }

  // Find each @mui/lab import statement
  const labImportRegex = /import\s+(?:\{[^}]*\}|[\w*]+)\s+from\s+['"]@mui\/lab(?:\/[^'"]*)?['"]/g;
  const matches = [...source.matchAll(labImportRegex)];

  if (matches.length > 0) {
    warnings.push(
      `${filePath}: Found ${matches.length} import(s) from @mui/lab. ` +
      'Some components were removed from @mui/lab in MUI v7. ' +
      'Run the official codemod to migrate: ' +
      '`npx @mui/codemod@latest v7.0.0/lab-removed-components <path>`. ' +
      'See: https://mui.com/material-ui/migration/upgrade-to-v7/'
    );
  }

  return { source, changed: false, changes: [], warnings };
}
