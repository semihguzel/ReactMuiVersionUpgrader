/**
 * Transformer: Accordion TransitionComponent/TransitionProps → slots/slotProps
 *
 * In MUI v6, Accordion's TransitionComponent and TransitionProps are deprecated
 * in favour of the new slots/slotProps API.
 *
 *   TransitionComponent={X}  →  slots={{ transition: X }}
 *   TransitionProps={Y}      →  slotProps={{ transition: Y }}
 *
 * If both are present on the same tag they are merged into one slots + slotProps pair.
 */
export function transformAccordionSlots(source, filePath) {
  const changes = [];
  const warnings = [];
  let modified = source;
  let changed = false;

  // Only process files that have Accordion in them
  if (!modified.includes('Accordion')) {
    return { source, changed: false, changes, warnings };
  }

  // Helper: extract the value expression string after an attribute (handles {} and complex exprs)
  // Returns { value, fullMatch } or null
  function extractJsxPropValue(str, propName) {
    // Matches propName={...} capturing balanced braces, or propName="..." or propName='...'
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
      const value = str.substring(afterEq + 1, i); // inner content
      return { value: value.trim(), fullMatch, propName };
    }
    if (firstChar === '"') {
      const end = str.indexOf('"', afterEq + 1);
      const fullMatch = str.substring(startIdx, end + 1);
      const value = str.substring(afterEq + 1, end);
      return { value: `"${value}"`, fullMatch, propName };
    }
    return null;
  }

  // Process each <Accordion ...> opening tag
  // This regex finds opening tags for Accordion (not AccordionSummary/Details/Actions)
  const accordionTagRegex = /<Accordion(?![A-Za-z])([^>]*(?:>(?!\/))?)/gs;

  modified = modified.replace(accordionTagRegex, (tagContent) => {
    let tag = tagContent;
    const tcProp = extractJsxPropValue(tag, 'TransitionComponent');
    const tpProp = extractJsxPropValue(tag, 'TransitionProps');

    if (!tcProp && !tpProp) return tag;

    let localChanged = false;

    if (tcProp) {
      tag = tag.replace(tcProp.fullMatch, '');
      const slotValue = `{{ transition: ${tcProp.value} }}`;
      // If slots already exists on tag, warn and skip merge
      if (/\bslots=/.test(tag)) {
        warnings.push(
          `${filePath}: Could not auto-migrate TransitionComponent on <Accordion>: ` +
          'a `slots` prop already exists. Manually merge: ' +
          `slots={{ transition: ${tcProp.value} }}`
        );
      } else {
        tag = tag.replace(/<Accordion(?![A-Za-z])/, `<Accordion slots=${slotValue}`);
        changes.push({ type: 'prop-rename', component: 'Accordion', from: 'TransitionComponent', to: 'slots.transition' });
        localChanged = true;
      }
    }

    if (tpProp) {
      tag = tag.replace(tpProp.fullMatch, '');
      const slotPropsValue = `{{ transition: ${tpProp.value} }}`;
      if (/\bslotProps=/.test(tag)) {
        warnings.push(
          `${filePath}: Could not auto-migrate TransitionProps on <Accordion>: ` +
          'a `slotProps` prop already exists. Manually merge: ' +
          `slotProps={{ transition: ${tpProp.value} }}`
        );
      } else {
        tag = tag.replace(/<Accordion(?![A-Za-z])/, `<Accordion slotProps=${slotPropsValue}`);
        changes.push({ type: 'prop-rename', component: 'Accordion', from: 'TransitionProps', to: 'slotProps.transition' });
        localChanged = true;
      }
    }

    if (localChanged) changed = true;
    return tag;
  });

  return { source: modified, changed, changes, warnings };
}
