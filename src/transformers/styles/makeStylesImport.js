import { stylesExports, materialStylesExports } from '../../data/packageMappings.js';

const stylesSet = new Set(stylesExports);
const materialSet = new Set(materialStylesExports);

/**
 * Updates makeStyles, withStyles, and related imports.
 *
 * In v4, these were exported from @material-ui/core/styles.
 * In v5:
 *   - makeStyles, withStyles, createStyles → @mui/styles (legacy)
 *   - createTheme, styled, alpha, ThemeProvider → @mui/material/styles
 *
 * This transformer splits mixed imports into the correct packages.
 */
export function transformMakeStylesImport(source, filePath) {
  let changed = false;
  const changes = [];
  const warnings = [];
  let result = source;

  // Match imports from @mui/material/styles (already renamed by packageRename)
  const styleImportPattern = /import\s+(type\s+)?\{([^}]+)\}\s+from\s+(['"])@mui\/material\/styles\3\s*;?/g;

  result = result.replace(styleImportPattern, (match, typeKw, specifiers, q) => {
    const typePrefix = typeKw || '';
    const specs = specifiers.split(',').map(s => s.trim()).filter(Boolean);

    const muiStylesSpecs = []; // Go to @mui/styles
    const materialStylesSpecs = []; // Stay in @mui/material/styles
    const otherSpecs = []; // Unknown, keep in @mui/material/styles

    for (const spec of specs) {
      const baseName = spec.split(/\s+as\s+/)[0].trim();

      if (stylesSet.has(baseName) && !materialSet.has(baseName)) {
        muiStylesSpecs.push(spec);
      } else {
        materialStylesSpecs.push(spec);
      }
    }

    if (muiStylesSpecs.length === 0) return match; // Nothing to split

    changed = true;
    changes.push({
      type: 'styles-import-split',
      movedToMuiStyles: muiStylesSpecs,
      keptInMaterialStyles: materialStylesSpecs,
    });

    const lines = [];

    if (materialStylesSpecs.length > 0) {
      lines.push(
        `import ${typePrefix}{ ${materialStylesSpecs.join(', ')} } from ${q}@mui/material/styles${q};`
      );
    }

    lines.push(
      `import ${typePrefix}{ ${muiStylesSpecs.join(', ')} } from ${q}@mui/styles${q};`
    );

    if (muiStylesSpecs.length > 0) {
      warnings.push(
        '@mui/styles is a legacy package. Consider migrating makeStyles/withStyles to ' +
        'styled() or sx prop for better performance and tree-shaking.'
      );
    }

    return lines.join('\n');
  });

  // Also handle direct @mui/styles imports that might use wrong path
  // import { makeStyles } from '@mui/material'  → should be '@mui/styles'
  const materialBarrelPattern = /import\s+(type\s+)?\{([^}]+)\}\s+from\s+(['"])@mui\/material\3\s*;?/g;

  result = result.replace(materialBarrelPattern, (match, typeKw, specifiers, q) => {
    const typePrefix = typeKw || '';
    const specs = specifiers.split(',').map(s => s.trim()).filter(Boolean);

    const shouldMoveToStyles = [];
    const shouldStay = [];

    for (const spec of specs) {
      const baseName = spec.split(/\s+as\s+/)[0].trim();
      if (stylesSet.has(baseName) && !materialSet.has(baseName)) {
        shouldMoveToStyles.push(spec);
      } else {
        shouldStay.push(spec);
      }
    }

    if (shouldMoveToStyles.length === 0) return match;

    changed = true;
    changes.push({
      type: 'styles-import-move',
      moved: shouldMoveToStyles,
    });

    const lines = [];
    if (shouldStay.length > 0) {
      lines.push(
        `import ${typePrefix}{ ${shouldStay.join(', ')} } from ${q}@mui/material${q};`
      );
    }
    lines.push(
      `import ${typePrefix}{ ${shouldMoveToStyles.join(', ')} } from ${q}@mui/styles${q};`
    );

    return lines.join('\n');
  });

  return { source: result, changed, changes, warnings };
}
