/**
 * Renames fade() → alpha()
 *
 * v4: import { fade } from '@material-ui/core/styles'
 *     fade(color, 0.5)
 *
 * v5: import { alpha } from '@mui/material/styles'
 *     alpha(color, 0.5)
 */
export function transformFadeToAlpha(source, filePath) {
  let changed = false;
  const changes = [];
  let result = source;

  if (!result.includes('fade')) {
    return { source, changed: false, changes: [] };
  }

  // Check if 'fade' is imported from MUI styles
  const hasFadeImport = /import\s+\{[^}]*\bfade\b[^}]*\}\s+from\s+['"]@(?:material-ui\/core\/styles|mui\/material\/styles|material-ui\/core|mui\/material)['"]/.test(result);

  if (!hasFadeImport) {
    return { source, changed: false, changes: [] };
  }

  // Rename in import specifier: { fade } → { alpha }, { fade as myFade } → { alpha as myFade }
  const importPattern = /(\bimport\s+\{[^}]*)\bfade\b([^}]*\})/g;
  result = result.replace(importPattern, (match, before, after) => {
    changed = true;
    return `${before}alpha${after}`;
  });

  // Rename function calls: fade( → alpha(
  // Be careful not to match other functions ending in 'fade' (e.g., crossfade)
  // Only match standalone 'fade' followed by '('
  const callPattern = /\bfade\s*\(/g;
  result = result.replace(callPattern, 'alpha(');

  if (result !== source) {
    changed = true;
    changes.push({
      type: 'function-rename',
      from: 'fade',
      to: 'alpha',
    });
  }

  return { source: result, changed, changes };
}
