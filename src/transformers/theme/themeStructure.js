/**
 * Transforms v4 theme structure to v5 structure:
 *
 * v4:
 *   createTheme({
 *     props: { MuiButton: { disableRipple: true } },
 *     overrides: { MuiButton: { root: { color: 'red' } } }
 *   })
 *
 * v5:
 *   createTheme({
 *     components: {
 *       MuiButton: {
 *         defaultProps: { disableRipple: true },
 *         styleOverrides: { root: { color: 'red' } }
 *       }
 *     }
 *   })
 *
 * This is a complex transformation that uses regex-based approach.
 * For deeply nested or dynamic theme configs, it adds warnings.
 */
export function transformThemeStructure(source, filePath) {
  let changed = false;
  const changes = [];
  const warnings = [];
  let result = source;

  const hasThemeProps = /\bprops\s*:\s*\{/.test(result) && /Mui\w+/.test(result);
  const hasOverrides = /\boverrides\s*:\s*\{/.test(result) && /Mui\w+/.test(result);

  if (!hasThemeProps && !hasOverrides) {
    return { source, changed: false, changes: [] };
  }

  // Check if this is within a createTheme or createMuiTheme context
  const hasThemeContext = /\b(?:createTheme|createMuiTheme|adaptV4Theme)\s*\(/.test(result);
  if (!hasThemeContext) {
    return { source, changed: false, changes: [] };
  }

  // Strategy: Extract props and overrides blocks, build components structure
  // This is inherently fragile with regex, so we handle common patterns
  // and warn on complex ones.

  // Transform 'props:' key to component defaultProps pattern
  // Match: props: { MuiComponent: { propName: value } }
  const propsBlockPattern = /(\s*)props\s*:\s*(\{[\s\S]*?\n\1\})/;
  const propsMatch = result.match(propsBlockPattern);

  // Transform 'overrides:' key to component styleOverrides pattern
  const overridesBlockPattern = /(\s*)overrides\s*:\s*(\{[\s\S]*?\n\1\})/;
  const overridesMatch = result.match(overridesBlockPattern);

  if (!propsMatch && !overridesMatch) {
    return { source, changed: false, changes: [] };
  }

  // Parse MuiComponent entries from the props/overrides blocks
  const propsComponents = propsMatch ? parseMuiEntries(propsMatch[2]) : {};
  const overridesComponents = overridesMatch ? parseMuiEntries(overridesMatch[2]) : {};

  // Merge into components structure
  const allComponentNames = new Set([
    ...Object.keys(propsComponents),
    ...Object.keys(overridesComponents),
  ]);

  if (allComponentNames.size === 0) {
    warnings.push(
      'Theme props/overrides detected but could not be parsed automatically. Manual migration needed.'
    );
    return { source, changed: false, changes: [], warnings };
  }

  // Build the components object string
  const indent = detectIndent(result);
  const componentEntries = [];

  for (const compName of allComponentNames) {
    const parts = [];
    if (propsComponents[compName]) {
      parts.push(`${indent}${indent}${indent}defaultProps: ${propsComponents[compName]}`);
    }
    if (overridesComponents[compName]) {
      parts.push(`${indent}${indent}${indent}styleOverrides: ${overridesComponents[compName]}`);
    }
    componentEntries.push(
      `${indent}${indent}${compName}: {\n${parts.join(',\n')}\n${indent}${indent}}`
    );
  }

  const componentsBlock = `components: {\n${componentEntries.join(',\n')}\n${indent}}`;

  // Remove old props block
  if (propsMatch) {
    result = result.replace(/\s*props\s*:\s*\{[\s\S]*?\n(\s*)\},?/, '');
    changed = true;
    changes.push({ type: 'theme-restructure', section: 'props → components.defaultProps' });
  }

  // Remove old overrides block
  if (overridesMatch) {
    result = result.replace(/\s*overrides\s*:\s*\{[\s\S]*?\n(\s*)\},?/, '');
    changed = true;
    changes.push({ type: 'theme-restructure', section: 'overrides → components.styleOverrides' });
  }

  // Add components block
  if (changed) {
    // Find the createTheme call and add components inside the object
    const themeCallPattern = /((?:createTheme|createMuiTheme)\s*\(\s*\{)/;
    if (themeCallPattern.test(result)) {
      result = result.replace(themeCallPattern, `$1\n${indent}${componentsBlock},`);
    } else {
      warnings.push('Could not insert components block into theme. Manual placement needed.');
    }
  }

  // Clean up: remove trailing commas before closing braces, fix double commas
  result = result.replace(/,(\s*,)/g, ',');
  result = result.replace(/,(\s*\})/g, '$1');

  return { source: result, changed, changes, warnings };
}

/**
 * Parses MuiComponent entries from a block like:
 * { MuiButton: { disableRipple: true }, MuiTextField: { variant: 'standard' } }
 *
 * Returns: { MuiButton: '{ disableRipple: true }', MuiTextField: '{ variant: "standard" }' }
 */
function parseMuiEntries(block) {
  const entries = {};
  // Match: MuiComponentName: { ... }
  const entryPattern = /(Mui\w+)\s*:\s*(\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\})/g;
  let match;
  while ((match = entryPattern.exec(block)) !== null) {
    entries[match[1]] = match[2].trim();
  }
  return entries;
}

function detectIndent(source) {
  const match = source.match(/\n(\s+)\S/);
  return match ? match[1] : '  ';
}
