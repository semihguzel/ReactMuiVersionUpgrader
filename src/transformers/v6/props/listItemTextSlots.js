/**
 * Transformer: ListItemText primaryTypographyProps/secondaryTypographyProps → slotProps
 *
 * In MUI v6, the `primaryTypographyProps` and `secondaryTypographyProps` props
 * on ListItemText are deprecated in favour of slotProps:
 *
 *   primaryTypographyProps={X}   →  slotProps={{ primary: X }}
 *   secondaryTypographyProps={X} →  slotProps={{ secondary: X }}
 *
 * If both are present, they are merged into a single slotProps object.
 * If `slotProps` already exists on the tag, the transformer warns and skips.
 */
export function transformListItemTextSlots(source, filePath) {
  const changes = [];
  const warnings = [];
  let modified = source;
  let changed = false;

  if (!modified.includes('ListItemText')) {
    return { source, changed: false, changes, warnings };
  }

  const tagRegex = /<ListItemText(?![A-Za-z])([\s\S]*?)(?=\/>|>)/g;

  modified = modified.replace(tagRegex, (tagContent) => {
    let tag = tagContent;

    const primaryProp = extractJsxPropValue(tag, 'primaryTypographyProps');
    const secondaryProp = extractJsxPropValue(tag, 'secondaryTypographyProps');

    if (!primaryProp && !secondaryProp) return tag;

    // If slotProps already exists, warn and don't touch
    if (/\bslotProps=/.test(tag)) {
      if (primaryProp || secondaryProp) {
        warnings.push(
          `${filePath}: <ListItemText> has both legacy typography props and an existing \`slotProps\`. ` +
          'Please manually merge primaryTypographyProps / secondaryTypographyProps into slotProps. ' +
          'See: https://mui.com/material-ui/migration/upgrade-to-v6/#listitemtext'
        );
      }
      return tag;
    }

    // Remove the old props
    if (primaryProp) {
      tag = tag.replace(primaryProp.fullMatch, '');
    }
    if (secondaryProp) {
      tag = tag.replace(secondaryProp.fullMatch, '');
    }

    // Build the new slotProps value
    let slotPropsContent = '';
    if (primaryProp && secondaryProp) {
      slotPropsContent = `{{ primary: ${primaryProp.value}, secondary: ${secondaryProp.value} }}`;
    } else if (primaryProp) {
      slotPropsContent = `{{ primary: ${primaryProp.value} }}`;
    } else {
      slotPropsContent = `{{ secondary: ${secondaryProp.value} }}`;
    }

    tag = tag.replace(/<ListItemText(?![A-Za-z])/, `<ListItemText slotProps=${slotPropsContent}`);

    if (primaryProp) {
      changes.push({ type: 'prop-rename', component: 'ListItemText', from: 'primaryTypographyProps', to: 'slotProps.primary' });
    }
    if (secondaryProp) {
      changes.push({ type: 'prop-rename', component: 'ListItemText', from: 'secondaryTypographyProps', to: 'slotProps.secondary' });
    }
    changed = true;
    return tag;
  });

  return { source: modified, changed, changes, warnings };
}

/**
 * Extracts the full prop assignment and its inner value from a JSX tag string.
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
    return {
      value: `"${str.substring(afterEq + 1, end)}"`,
      fullMatch: str.substring(startIdx, end + 1),
    };
  }

  return null;
}
