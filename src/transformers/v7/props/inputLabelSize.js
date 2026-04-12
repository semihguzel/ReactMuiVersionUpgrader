import { v7InputLabelSizeProp } from '../../../data/v7/propRenames.js';

/**
 * Transformer: InputLabel (and related) size prop value rename for MUI v7.
 *
 * `size="normal"` → `size="medium"` on InputLabel, Button, and TextField.
 * Also handles the JSX expression form: size={'normal'} → size={'medium'}
 */
export function transformInputLabelSize(source, filePath) {
  const changes = [];
  const warnings = [];
  let modified = source;
  let changed = false;

  const { components, from, to } = v7InputLabelSizeProp;

  // Early exit if none of the target components appear in the file
  if (!components.some(c => modified.includes(`<${c}`))) {
    return { source: modified, changed, changes, warnings };
  }

  // Early exit if size="normal" (or equivalent) is not present
  if (!modified.includes(`size="${from}"`) && !modified.includes(`size={'${from}'}`)) {
    return { source: modified, changed, changes, warnings };
  }

  // Replace size="normal" → size="medium"
  const doubleQuoteRegex = new RegExp(`size="${from}"`, 'g');
  if (doubleQuoteRegex.test(modified)) {
    modified = modified.replace(new RegExp(`size="${from}"`, 'g'), `size="${to}"`);
    changes.push({ type: 'prop-value-change', prop: 'size', from, to });
    changed = true;
  }

  // Replace size={'normal'} → size={'medium'}
  const singleQuoteExprRegex = new RegExp(`size=\\{'${from}'\\}`, 'g');
  if (singleQuoteExprRegex.test(modified)) {
    modified = modified.replace(new RegExp(`size=\\{'${from}'\\}`, 'g'), `size={'${to}'}`);
    if (!changed) {
      changes.push({ type: 'prop-value-change', prop: 'size', from, to });
    }
    changed = true;
  }

  return { source: modified, changed, changes, warnings };
}
