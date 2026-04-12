/**
 * Transformer: TextField / Select variant default warning (MUI v6)
 *
 * In MUI v6, the default variant for TextField and Select is "outlined"
 * (not "standard" as it was in some contexts). The v4→v5 migration already
 * added explicit `variant="standard"` to all components. However, if a
 * project skips v4→v5 or has newly added components, those without an
 * explicit `variant` may behave differently in v6.
 *
 * This transformer warns when TextField or Select components are found
 * without an explicit `variant` prop.
 */
export function transformVariantDefaultsV6(source, filePath) {
  const changes = [];
  const warnings = [];

  const COMPONENTS = ['TextField', 'Select'];

  for (const component of COMPONENTS) {
    if (!source.includes(`<${component}`)) continue;

    const tagRegex = new RegExp(`<${component}(?![A-Za-z])((?:[^>]|\\n)*?)(?=/>|>)`, 'g');
    let match;
    while ((match = tagRegex.exec(source)) !== null) {
      const attrs = match[1];
      // Check if variant prop is present
      if (!/\bvariant=/.test(attrs)) {
        warnings.push(
          `${filePath}: <${component}> has no explicit \`variant\` prop. ` +
          'In MUI v6 the default variant is "outlined". ' +
          'Add variant="outlined" (or "standard"/"filled") to make it explicit and avoid unexpected visual changes. ' +
          'See: https://mui.com/material-ui/migration/upgrade-to-v6/#textfield'
        );
      }
    }
  }

  return { source, changed: false, changes, warnings };
}
