/**
 * Transformer: palette.mode conditional → theme.applyStyles() warning
 *
 * In MUI v6, the recommended way to apply mode-specific styles is via
 * `theme.applyStyles('dark', { ... })` instead of checking `theme.palette.mode`.
 *
 * This transformer is WARNING-ONLY — it detects `palette.mode` comparisons and
 * reports them with guidance, without auto-rewriting (the transformation is too
 * semantic to do safely with regex).
 */
export function transformApplyStyles(source, filePath) {
  const warnings = [];

  // Match palette.mode === 'dark'|'light' and palette.mode !== 'dark'|'light'
  const modePatterns = [
    /palette\.mode\s*===\s*['"](?:dark|light)['"]/g,
    /palette\.mode\s*!==\s*['"](?:dark|light)['"]/g,
    /palette\.mode\s*==\s*['"](?:dark|light)['"]/g,
  ];

  const lines = source.split('\n');

  for (const pattern of modePatterns) {
    let match;
    while ((match = pattern.exec(source)) !== null) {
      // Find approximate line number
      const lineIndex = source.substring(0, match.index).split('\n').length;
      warnings.push(
        `${filePath}:${lineIndex}: Found \`${match[0]}\` — ` +
        'In MUI v6, consider replacing palette.mode checks with `theme.applyStyles("dark", { ... })`. ' +
        'This provides better support for CSS variables and the new color scheme system. ' +
        'See: https://mui.com/material-ui/migration/upgrade-to-v6/#theme-applystyles'
      );
    }
  }

  return { source, changed: false, changes: [], warnings };
}
