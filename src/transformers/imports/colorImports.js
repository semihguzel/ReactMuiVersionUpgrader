/**
 * Fixes deep color and style-utility imports that no longer exist as sub-paths in v5.
 *
 * 1. Color palette deep imports
 *    v4: import red from '@material-ui/core/colors/red'
 *    v5: import { red } from '@mui/material/colors'
 *
 * 2. colorManipulator deep import
 *    v4: import { fade, lighten } from '@material-ui/core/styles/colorManipulator'
 *    v5: import { alpha, lighten } from '@mui/material/styles'
 *    (the path was also left as @mui/material/styles/colorManipulator after packageRename ran)
 *
 *    Note: `fade` was renamed to `alpha` in v5.
 */
export function transformColorImports(source, filePath) {
  let changed = false;
  const changes = [];
  let result = source;

  // ── 1. Palette color deep imports ──────────────────────────────────────────
  // Pattern: import <name> from '@mui/material/colors/<colorName>'
  // or:      import <name> from '@material-ui/core/colors/<colorName>'
  const colorImportPattern = /import\s+(\w+)\s+from\s+(['"])(@mui\/material|@material-ui\/core)\/colors\/(\w+)\2\s*;?/g;

  result = result.replace(colorImportPattern, (match, localName, q, pkg, colorName) => {
    changed = true;
    changes.push({
      type: 'color-import-fix',
      from: `${pkg}/colors/${colorName}`,
      to: '@mui/material/colors',
      localName,
      colorName,
    });

    if (localName === colorName) {
      return `import { ${colorName} } from ${q}@mui/material/colors${q};`;
    }
    return `import { ${colorName} as ${localName} } from ${q}@mui/material/colors${q};`;
  });

  // ── 2. colorManipulator deep import ────────────────────────────────────────
  // Matches both the original v4 path and the already-renamed @mui/material path.
  const colorManipulatorPattern =
    /import\s+(\{[^}]+\})\s+from\s+(['"])(?:@material-ui\/core|@mui\/material)\/styles\/colorManipulator\2\s*;?/g;

  result = result.replace(colorManipulatorPattern, (match, specifiers, q) => {
    // Rename `fade` → `alpha` inside the specifier list
    const updatedSpecifiers = specifiers.replace(/\bfade\b/g, 'alpha');
    changed = true;
    changes.push({
      type: 'color-manipulator-import-fix',
      from: 'styles/colorManipulator',
      to: '@mui/material/styles',
      renamed: updatedSpecifiers !== specifiers ? 'fade → alpha' : null,
    });
    return `import ${updatedSpecifiers} from ${q}@mui/material/styles${q};`;
  });

  return { source: result, changed, changes };
}
