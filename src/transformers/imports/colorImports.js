/**
 * Fixes nested color imports that are now private in v5.
 *
 * v4: import red from '@material-ui/core/colors/red'
 *     import { red } from '@material-ui/core/colors'  (already ok)
 *
 * v5: import { red } from '@mui/material/colors'
 *
 * Also handles:
 *   import red from '@mui/material/colors/red'  → import { red } from '@mui/material/colors'
 */
export function transformColorImports(source, filePath) {
  let changed = false;
  const changes = [];
  let result = source;

  // Pattern: import <name> from '@mui/material/colors/<colorName>'
  // or: import <name> from '@material-ui/core/colors/<colorName>'
  const colorImportPattern = /import\s+(\w+)\s+from\s+(['"])(@mui\/material|@material-ui\/core)\/colors\/(\w+)\2\s*;?/g;

  result = result.replace(colorImportPattern, (match, localName, q, pkg, colorName) => {
    changed = true;
    changes.push({
      type: 'color-import-fix',
      from: `${pkg}/colors/${colorName}`,
      to: `@mui/material/colors`,
      localName,
      colorName,
    });

    // If the local name matches the color, use named import
    if (localName === colorName) {
      return `import { ${colorName} } from ${q}@mui/material/colors${q};`;
    }
    // If aliased, use 'as' syntax
    return `import { ${colorName} as ${localName} } from ${q}@mui/material/colors${q};`;
  });

  return { source: result, changed, changes };
}
