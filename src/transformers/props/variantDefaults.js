/**
 * Adds explicit variant="standard" to TextField, FormControl, and Select
 * that don't already have a variant prop.
 *
 * In v4, the default variant was "standard".
 * In v5, the default variant changed to "outlined".
 * To preserve v4 behavior, we add explicit variant="standard".
 */

const targetComponents = ['TextField', 'FormControl', 'Select'];

export function transformVariantDefaults(source, filePath) {
  let changed = false;
  const changes = [];
  let result = source;

  // Check if file imports any of these components from MUI
  const hasMuiImport = /['"]@(?:material-ui\/core|mui\/material)/.test(result);
  if (!hasMuiImport) return { source, changed: false, changes: [] };

  for (const component of targetComponents) {
    // Check if this component is used in the file
    if (!result.includes(component)) continue;

    // Match JSX opening tags for this component that DON'T already have variant prop
    // Self-closing: <TextField ... />
    // Opening: <TextField ...>
    const tagPattern = new RegExp(
      `(<${component}\\b)([^>]*?)(\\/?>)`,
      'g'
    );

    result = result.replace(tagPattern, (match, tagStart, attrs, tagEnd) => {
      // Skip if variant is already specified
      if (/\bvariant\s*=/.test(attrs)) return match;

      // Skip if this is a closing tag somehow matched
      if (match.startsWith('</')) return match;

      changed = true;
      changes.push({
        type: 'add-default-variant',
        component,
        value: 'standard',
      });

      return `${tagStart}${attrs} variant="standard"${tagEnd}`;
    });
  }

  return { source: result, changed, changes };
}
