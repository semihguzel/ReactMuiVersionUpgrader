/**
 * Transformer: Unstable_Grid2 → Grid2
 *
 * In MUI v6, Grid2 was stabilised and the Unstable_ prefix was removed.
 * This transformer handles:
 *   - Named import renames: import { Unstable_Grid2 } → import { Grid2 }
 *   - Default import renames from deep path: import Unstable_Grid2 from '@mui/material/Unstable_Grid2'
 *   - Deep import path: '@mui/material/Unstable_Grid2' → '@mui/material/Grid2'
 *   - JSX usage: <Unstable_Grid2 → <Grid2, </Unstable_Grid2> → </Grid2>
 *   - TypeScript type references
 *   - Removal of the removed `disableEqualOverflow` prop (with warning)
 */
export function transformGrid2Rename(source, filePath) {
  const changes = [];
  const warnings = [];
  let modified = source;
  let changed = false;

  // 1. Deep import path rename: '@mui/material/Unstable_Grid2' → '@mui/material/Grid2'
  const deepImportRegex = /(['"])(@mui\/material\/Unstable_Grid2)\1/g;
  if (deepImportRegex.test(modified)) {
    modified = modified.replace(
      /(['"])(@mui\/material\/Unstable_Grid2)\1/g,
      (_, quote) => `${quote}@mui/material/Grid2${quote}`
    );
    changes.push({ type: 'import-path-rename', from: '@mui/material/Unstable_Grid2', to: '@mui/material/Grid2' });
    changed = true;
  }

  // 2. Named import specifier rename: { Unstable_Grid2 } or { Unstable_Grid2 as X }
  const namedImportRegex = /\bUnstable_Grid2\b/g;
  if (namedImportRegex.test(modified)) {
    modified = modified.replace(/\bUnstable_Grid2\b/g, 'Grid2');
    changes.push({ type: 'component-rename', from: 'Unstable_Grid2', to: 'Grid2' });
    changed = true;
  }

  // 3. Remove disableEqualOverflow prop from JSX (self-closing and open tags)
  // Matches: disableEqualOverflow={...}, disableEqualOverflow="...", or bare disableEqualOverflow
  const disablePropRegex = /\s+disableEqualOverflow(?:=(?:\{[^}]*\}|"[^"]*"|'[^']*')|(?=[\s/>]))/g;
  if (disablePropRegex.test(modified)) {
    modified = modified.replace(
      /\s+disableEqualOverflow(?:=(?:\{[^}]*\}|"[^"]*"|'[^']*')|(?=[\s/>]))/g,
      ''
    );
    changes.push({ type: 'prop-removed', component: 'Grid2', prop: 'disableEqualOverflow' });
    warnings.push(
      `${filePath}: Removed 'disableEqualOverflow' from Grid2. ` +
      'This prop no longer exists in v6. Grid items no longer include spacing — use the container\'s gap property instead. ' +
      'See: https://mui.com/material-ui/migration/upgrade-to-v6/#grid2'
    );
    changed = true;
  }

  return { source: modified, changed, changes, warnings };
}
