import { packageMappings, deepImportMappings } from '../../data/packageMappings.js';

/**
 * Transforms all @material-ui/* imports to @mui/* equivalents.
 * Handles:
 *   - Barrel imports: import { Button } from '@material-ui/core'
 *   - Deep imports: import Button from '@material-ui/core/Button'
 *   - Dynamic imports: import('@material-ui/core/Button')
 *   - Require calls: require('@material-ui/core')
 *   - Type imports: import type { ButtonProps } from '@material-ui/core'
 */
export function transformPackageRenames(source, filePath) {
  let changed = false;
  const changes = [];

  let result = source;

  // Build a combined mapping: deep imports first (more specific), then package-level
  const allMappings = { ...deepImportMappings };
  for (const [v4, v5] of Object.entries(packageMappings)) {
    allMappings[v4] = v5;
  }

  // Sort by length descending so more specific paths match first
  const sortedEntries = Object.entries(allMappings).sort(
    (a, b) => b[0].length - a[0].length
  );

  for (const [v4Path, v5Path] of sortedEntries) {
    // Match import/require statements containing the old package path
    // Handles: '@material-ui/core', '@material-ui/core/Button', '@material-ui/core/styles'
    const escapedPath = v4Path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Pattern matches the package path in quotes, allowing for subpaths
    const pattern = new RegExp(
      `(['"])${escapedPath}(/[^'"]*)?(['"])`,
      'g'
    );

    result = result.replace(pattern, (match, q1, subpath, q2) => {
      const oldFull = `${v4Path}${subpath || ''}`;
      const newFull = `${v5Path}${subpath || ''}`;

      // Don't transform if it's already the v5 path
      if (oldFull === newFull) return match;

      changed = true;
      changes.push({
        type: 'import-rename',
        from: oldFull,
        to: newFull,
      });

      return `${q1}${newFull}${q2}`;
    });
  }

  return { source: result, changed, changes };
}
