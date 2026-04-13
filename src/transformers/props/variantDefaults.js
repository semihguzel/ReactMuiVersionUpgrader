/**
 * Adds explicit variant="standard" to TextField, FormControl, and Select
 * that don't already have a variant prop.
 *
 * In v4, the default variant was "standard".
 * In v5, the default variant changed to "outlined".
 * To preserve v4 behavior, we add explicit variant="standard".
 */
import { scanJSXTags } from '../utils/jsxTagParser.js';

const targetComponents = ['TextField', 'FormControl', 'Select'];

export function transformVariantDefaults(source, filePath) {
  let changed = false;
  const changes = [];
  let result = source;

  // Check if file imports any of these components from MUI
  const hasMuiImport = /['"]@(?:material-ui\/core|mui\/material)/.test(result);
  if (!hasMuiImport) return { source, changed: false, changes: [] };

  for (const component of targetComponents) {
    if (!result.includes(component)) continue;

    // Collect insertion points (closeStart positions) right-to-left so that
    // inserting text at one position doesn't shift subsequent positions.
    const insertions = [];

    for (const tag of scanJSXTags(result, component)) {
      if (/\bvariant\s*=/.test(tag.attrText)) continue;
      insertions.push(tag.closeStart);
    }

    // Apply right-to-left so earlier offsets stay valid
    for (let i = insertions.length - 1; i >= 0; i--) {
      const pos = insertions[i];
      result = result.slice(0, pos) + ' variant="standard"' + result.slice(pos);
      changed = true;
    }

    if (insertions.length > 0) {
      changes.push({ type: 'add-default-variant', component, value: 'standard' });
    }
  }

  return { source: result, changed, changes };
}
