/**
 * Transformer: Grid/Grid2 rename for MUI v7
 *
 * In MUI v7:
 *   - Grid2 (stabilised in v6) becomes the new default Grid
 *   - The old Grid becomes GridLegacy
 *
 * This transformer uses a two-pass approach within a single function call
 * to avoid collision:
 *
 *   Pass 1 — Grid  → GridLegacy  (must run first)
 *   Pass 2 — Grid2 → Grid        (runs after Pass 1 has renamed the old Grid)
 *
 * The negative lookahead (?![A-Za-z\d_]) on all JSX/identifier patterns
 * ensures that `GridLegacy` introduced in Pass 1 is never re-matched
 * by Pass 2's `Grid` patterns.
 */
export function transformGridRename(source, filePath) {
  const changes = [];
  const warnings = [];
  let modified = source;
  let changed = false;

  const hasGrid  = /\bGrid\b/.test(modified);
  const hasGrid2 = /\bGrid2\b/.test(modified);

  if (!hasGrid && !hasGrid2) {
    return { source: modified, changed, changes, warnings };
  }

  // ─── Pass 1: Grid → GridLegacy ───────────────────────────────────────────

  if (hasGrid) {
    // 1a. Deep import path: '@mui/material/Grid' (exact, not Grid2)
    const deepGridPathRegex = /(['"])(@mui\/material\/Grid)(?!2|Legacy)\1/g;
    if (deepGridPathRegex.test(modified)) {
      modified = modified.replace(
        /(['"])(@mui\/material\/Grid)(?!2|Legacy)\1/g,
        (_, q) => `${q}@mui/material/GridLegacy${q}`
      );
      changes.push({ type: 'import-path-rename', from: '@mui/material/Grid', to: '@mui/material/GridLegacy' });
      changed = true;
    }

    // 1b. Named import specifier: { Grid } or { Grid as Foo } — not Grid2, not GridLegacy
    //     Matches "Grid" preceded by { or , and space, followed by word boundary
    const namedGridImportRegex = /(?<=[\{,]\s*)Grid(?!2|Legacy|Props)(?=\s*[,\}]|\s+as\b)/g;
    if (namedGridImportRegex.test(modified)) {
      modified = modified.replace(
        /(?<=[\{,]\s*)Grid(?!2|Legacy|Props)(?=\s*[,\}]|\s+as\b)/g,
        'GridLegacy'
      );
      changes.push({ type: 'component-rename', from: 'Grid', to: 'GridLegacy' });
      changed = true;
    }

    // 1c. JSX opening tags: <Grid  <Grid/ <Grid>
    const jsxOpenGridRegex = /<Grid(?![2A-Za-z\d_])/g;
    if (jsxOpenGridRegex.test(modified)) {
      modified = modified.replace(/<Grid(?![2A-Za-z\d_])/g, '<GridLegacy');
      changed = true;
    }

    // 1d. JSX closing tags: </Grid>
    const jsxCloseGridRegex = /<\/Grid(?![2A-Za-z\d_])/g;
    if (jsxCloseGridRegex.test(modified)) {
      modified = modified.replace(/<\/Grid(?![2A-Za-z\d_])/g, '</GridLegacy');
      changed = true;
    }

    // 1e. TypeScript type: GridProps → GridLegacyProps
    const gridPropsRegex = /\bGridProps\b(?!2)/g;
    if (gridPropsRegex.test(modified)) {
      modified = modified.replace(/\bGridProps\b(?!2)/g, 'GridLegacyProps');
      changes.push({ type: 'type-rename', from: 'GridProps', to: 'GridLegacyProps' });
      changed = true;
    }
  }

  // ─── Pass 2: Grid2 → Grid ────────────────────────────────────────────────
  // By now all old "Grid" occurrences are "GridLegacy", so no collision risk.

  if (hasGrid2) {
    // 2a. Deep import path: '@mui/material/Grid2'
    const deepGrid2PathRegex = /(['"])(@mui\/material\/Grid2)\1/g;
    if (deepGrid2PathRegex.test(modified)) {
      modified = modified.replace(
        /(['"])(@mui\/material\/Grid2)\1/g,
        (_, q) => `${q}@mui/material/Grid${q}`
      );
      changes.push({ type: 'import-path-rename', from: '@mui/material/Grid2', to: '@mui/material/Grid' });
      changed = true;
    }

    // 2b. Named import specifier: { Grid2 }
    const namedGrid2ImportRegex = /\bGrid2\b/g;
    if (namedGrid2ImportRegex.test(modified)) {
      modified = modified.replace(/\bGrid2\b/g, 'Grid');
      changes.push({ type: 'component-rename', from: 'Grid2', to: 'Grid' });
      changed = true;
    }

    // 2c. JSX opening tags: <Grid2
    //     Note: after Pass 1 there are no bare <Grid tags left, only <GridLegacy
    const jsxOpenGrid2Regex = /<Grid2(?![A-Za-z\d_])/g;
    if (jsxOpenGrid2Regex.test(modified)) {
      modified = modified.replace(/<Grid2(?![A-Za-z\d_])/g, '<Grid');
      changed = true;
    }

    // 2d. JSX closing tags: </Grid2>
    const jsxCloseGrid2Regex = /<\/Grid2(?![A-Za-z\d_])/g;
    if (jsxCloseGrid2Regex.test(modified)) {
      modified = modified.replace(/<\/Grid2(?![A-Za-z\d_])/g, '</Grid');
      changed = true;
    }

    // 2e. TypeScript type: Grid2Props → GridProps
    const grid2PropsRegex = /\bGrid2Props\b/g;
    if (grid2PropsRegex.test(modified)) {
      modified = modified.replace(/\bGrid2Props\b/g, 'GridProps');
      changes.push({ type: 'type-rename', from: 'Grid2Props', to: 'GridProps' });
      changed = true;
    }
  }

  if (changed) {
    warnings.push(
      `${filePath}: Grid components renamed — Grid → GridLegacy, Grid2 → Grid. ` +
      'Verify JSX and prop usage. See: https://mui.com/material-ui/migration/upgrade-to-v7/#grid'
    );
  }

  return { source: modified, changed, changes, warnings };
}
