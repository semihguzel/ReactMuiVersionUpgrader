/**
 * Transformer: components/componentsProps → slots/slotProps migration
 *
 * In MUI v6, Modal, Backdrop, Popover, Tooltip, and Menu have migrated from
 * the `components` / `componentsProps` API to `slots` / `slotProps`.
 * Additionally, several named props are coalesced into the new slotProps object:
 *   - BackdropProps → slotProps.backdrop
 *   - TransitionComponent → slots.transition
 *   - TransitionProps → slotProps.transition
 */

const SLOT_COMPONENTS = ['Modal', 'Backdrop', 'Popover', 'Tooltip', 'Menu'];

// Named props → their slot key destination
const NAMED_SLOTS = { TransitionComponent: 'transition' };
const NAMED_SLOT_PROPS = { BackdropProps: 'backdrop', TransitionProps: 'transition' };

export function transformSlotsProps(source, filePath) {
  const changes = [];
  const warnings = [];
  let modified = source;
  let changed = false;

  const hasAny = SLOT_COMPONENTS.some(c => modified.includes(`<${c}`));
  if (!hasAny) return { source, changed: false, changes, warnings };

  for (const component of SLOT_COMPONENTS) {
    if (!modified.includes(`<${component}`)) continue;

    // Build regex to match opening tags of this component (not compound names)
    const tagRegex = new RegExp(`<${component}(?![A-Za-z])([\\s\\S]*?)(?=/>|>)`, 'g');

    modified = modified.replace(tagRegex, (tagContent) => {
      let tag = tagContent;
      let localChanged = false;

      // 1. Simple renames: components → slots, componentsProps → slotProps
      if (/\bcomponents=/.test(tag)) {
        tag = tag.replace(/\bcomponents=/g, 'slots=');
        changes.push({ type: 'prop-rename', component, from: 'components', to: 'slots' });
        localChanged = true;
      }
      if (/\bcomponentsProps=/.test(tag)) {
        tag = tag.replace(/\bcomponentsProps=/g, 'slotProps=');
        changes.push({ type: 'prop-rename', component, from: 'componentsProps', to: 'slotProps' });
        localChanged = true;
      }

      // 2. Named slots: TransitionComponent → slots.transition
      for (const [propName, slotKey] of Object.entries(NAMED_SLOTS)) {
        if (!tag.includes(`${propName}=`)) continue;
        const extracted = extractJsxPropValue(tag, propName);
        if (!extracted) continue;

        tag = tag.replace(extracted.fullMatch, '').trim();

        if (/\bslots=/.test(tag)) {
          warnings.push(
            `${filePath}: Could not auto-migrate ${propName} on <${component}>: ` +
            `\`slots\` already exists. Manually add: slots={{ ${slotKey}: ${extracted.value} }}`
          );
        } else {
          tag = tag.replace(
            new RegExp(`<${component}(?![A-Za-z])`),
            `<${component} slots={{ ${slotKey}: ${extracted.value} }}`
          );
          changes.push({ type: 'prop-rename', component, from: propName, to: `slots.${slotKey}` });
          localChanged = true;
        }
      }

      // 3. Named slotProps: BackdropProps / TransitionProps → slotProps.X
      for (const [propName, slotKey] of Object.entries(NAMED_SLOT_PROPS)) {
        if (!tag.includes(`${propName}=`)) continue;
        const extracted = extractJsxPropValue(tag, propName);
        if (!extracted) continue;

        tag = tag.replace(extracted.fullMatch, '').trim();

        if (/\bslotProps=/.test(tag)) {
          warnings.push(
            `${filePath}: Could not auto-migrate ${propName} on <${component}>: ` +
            `\`slotProps\` already exists. Manually merge: slotProps={{ ${slotKey}: ${extracted.value} }}`
          );
        } else {
          tag = tag.replace(
            new RegExp(`<${component}(?![A-Za-z])`),
            `<${component} slotProps={{ ${slotKey}: ${extracted.value} }}`
          );
          changes.push({ type: 'prop-rename', component, from: propName, to: `slotProps.${slotKey}` });
          localChanged = true;
        }
      }

      if (localChanged) changed = true;
      return tag;
    });
  }

  return { source: modified, changed, changes, warnings };
}

/**
 * Extracts the full prop assignment and its inner value from a JSX tag string.
 * Handles: propName={...}, propName="...", propName='...'
 */
function extractJsxPropValue(str, propName) {
  const startIdx = str.indexOf(`${propName}=`);
  if (startIdx === -1) return null;

  const afterEq = str.indexOf('=', startIdx) + 1;
  const firstChar = str[afterEq];

  if (firstChar === '{') {
    let depth = 0;
    let i = afterEq;
    for (; i < str.length; i++) {
      if (str[i] === '{') depth++;
      else if (str[i] === '}') {
        depth--;
        if (depth === 0) break;
      }
    }
    const fullMatch = str.substring(startIdx, i + 1);
    const value = str.substring(afterEq + 1, i).trim();
    return { value, fullMatch };
  }

  if (firstChar === '"') {
    const end = str.indexOf('"', afterEq + 1);
    if (end === -1) return null;
    const fullMatch = str.substring(startIdx, end + 1);
    const value = `"${str.substring(afterEq + 1, end)}"`;
    return { value, fullMatch };
  }

  if (firstChar === "'") {
    const end = str.indexOf("'", afterEq + 1);
    if (end === -1) return null;
    const fullMatch = str.substring(startIdx, end + 1);
    const value = `'${str.substring(afterEq + 1, end)}'`;
    return { value, fullMatch };
  }

  return null;
}
