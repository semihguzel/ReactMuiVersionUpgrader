/**
 * Transformer: System props → sx prop (MUI v6 deprecation)
 *
 * In MUI v6, system props (mt, mb, px, color, etc.) are deprecated on
 * Box, Typography, Link, Grid, and Stack. They should move to the `sx` prop.
 *
 * Auto-migration for simple scalar/string/number values:
 *   <Box mt={2} px="1rem" />  →  <Box sx={{ mt: 2, px: '1rem' }} />
 *
 * Dynamic expressions (variable references) receive a warning only.
 * The `color` prop on Typography is specifically warned about — in v6 it no
 * longer acts as a system prop at all; use `sx={{ color: '...' }}` instead.
 */

import { v6SystemPropComponents, v6SystemProps } from '../../../data/v6/propRenames.js';

export function transformSystemProps(source, filePath) {
  const changes = [];
  const warnings = [];
  let modified = source;
  let changed = false;

  const hasAny = v6SystemPropComponents.some(c => modified.includes(`<${c}`));
  if (!hasAny) return { source, changed: false, changes, warnings };

  for (const component of v6SystemPropComponents) {
    if (!modified.includes(`<${component}`)) continue;

    const tagRegex = new RegExp(`<${component}(?![A-Za-z])((?:[^>]|\\n)*?)(?=/>|>)`, 'g');

    modified = modified.replace(tagRegex, (tagContent) => {
      let tag = tagContent;
      const collectedSxProps = {}; // propName → value string
      const dynamicProps = []; // prop names that are dynamic (cannot auto-migrate)
      let localChanged = false;

      for (const prop of v6SystemProps) {
        // Special handling: `color` on Typography is not a system prop in v6
        if (prop === 'color' && component === 'Typography') {
          const colorProp = extractSimplePropValue(tag, 'color');
          if (colorProp) {
            warnings.push(
              `${filePath}: <Typography color="${colorProp.rawValue}"> — ` +
              'The `color` prop is no longer a system prop in MUI v6. Use `sx={{ color: ... }}` instead. ' +
              'See: https://mui.com/material-ui/migration/upgrade-to-v6/#typography'
            );
          }
          continue; // Don't auto-migrate color, just warn
        }

        const propMatch = extractSimplePropValue(tag, prop);
        if (!propMatch) continue;

        if (propMatch.isDynamic) {
          // Dynamic value — warn only
          dynamicProps.push(prop);
          warnings.push(
            `${filePath}: <${component}> has system prop \`${prop}\` with a dynamic value. ` +
            'System props are deprecated in v6. Move it to the `sx` prop manually. ' +
            'See: https://mui.com/material-ui/migration/upgrade-to-v6/#system-props'
          );
        } else {
          // Simple value — collect for auto-migration
          collectedSxProps[prop] = propMatch.value;
          tag = tag.replace(propMatch.fullMatch, '');
          localChanged = true;
        }
      }

      if (Object.keys(collectedSxProps).length === 0) return tag;

      // Build the sx object string
      const sxEntries = Object.entries(collectedSxProps)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');

      // If `sx` already exists, warn (merging is complex/risky)
      if (/\bsx=/.test(tag)) {
        warnings.push(
          `${filePath}: <${component}> has both system props and an existing \`sx\` prop. ` +
          `Please manually merge these props into sx: { ${sxEntries} }. ` +
          'See: https://mui.com/material-ui/migration/upgrade-to-v6/#system-props'
        );
        // Restore the removed props (put them back)
        for (const [k, v] of Object.entries(collectedSxProps)) {
          tag = tag.replace(new RegExp(`<${component}(?![A-Za-z])`), `<${component} ${k}={${v}}`);
        }
        return tagContent; // Return unchanged
      }

      // Add sx prop
      tag = tag.replace(
        new RegExp(`<${component}(?![A-Za-z])`),
        `<${component} sx={{ ${sxEntries} }}`
      );

      for (const prop of Object.keys(collectedSxProps)) {
        changes.push({ type: 'prop-to-sx', component, prop });
      }
      changed = true;

      return tag;
    });
  }

  return { source: modified, changed, changes, warnings };
}

/**
 * Extracts a JSX prop value from a tag string.
 * Returns { value, fullMatch, isDynamic, rawValue } or null.
 *
 * isDynamic=true means the value is a variable reference (not a literal).
 */
function extractSimplePropValue(str, propName) {
  // Match: propName={value} or propName="value" or propName='value'
  // The prop must be preceded by whitespace (not part of another prop name)
  const propStart = findPropStart(str, propName);
  if (propStart === -1) return null;

  const afterPropName = propStart + propName.length;
  const nextChar = str[afterPropName];

  if (nextChar === '=') {
    const afterEq = afterPropName + 1;
    const valueChar = str[afterEq];

    if (valueChar === '"') {
      const end = str.indexOf('"', afterEq + 1);
      if (end === -1) return null;
      const rawValue = str.substring(afterEq + 1, end);
      return {
        value: `"${rawValue}"`,
        rawValue,
        fullMatch: str.substring(propStart, end + 1),
        isDynamic: false,
      };
    }

    if (valueChar === "'") {
      const end = str.indexOf("'", afterEq + 1);
      if (end === -1) return null;
      const rawValue = str.substring(afterEq + 1, end);
      return {
        value: `"${rawValue}"`,
        rawValue,
        fullMatch: str.substring(propStart, end + 1),
        isDynamic: false,
      };
    }

    if (valueChar === '{') {
      let depth = 0;
      let i = afterEq;
      for (; i < str.length; i++) {
        if (str[i] === '{') depth++;
        else if (str[i] === '}') {
          depth--;
          if (depth === 0) break;
        }
      }
      const inner = str.substring(afterEq + 1, i).trim();
      const fullMatch = str.substring(propStart, i + 1);

      // Determine if it's a simple literal (number, string literal, boolean)
      const isNumberLiteral = /^\d+(\.\d+)?$/.test(inner);
      const isStringLiteral = /^(['"`]).*\1$/.test(inner);
      const isBooleanLiteral = inner === 'true' || inner === 'false';
      const isDynamic = !isNumberLiteral && !isStringLiteral && !isBooleanLiteral;

      return {
        value: inner,
        rawValue: inner,
        fullMatch,
        isDynamic,
      };
    }
  }

  // Bare boolean prop (e.g. <Box display)
  // Not applicable for system props which all need values
  return null;
}

/**
 * Finds the start index of a prop in a JSX tag string, ensuring it's
 * preceded by whitespace (not part of another identifier).
 */
function findPropStart(str, propName) {
  let idx = 0;
  while (idx < str.length) {
    const found = str.indexOf(propName, idx);
    if (found === -1) return -1;

    // Check char before: must be whitespace or start of string
    const before = found > 0 ? str[found - 1] : ' ';
    if (/\s/.test(before)) {
      // Check char after: must be = or whitespace or end (for boolean props)
      const after = str[found + propName.length];
      if (after === '=' || /[\s/>]/.test(after) || after === undefined) {
        return found;
      }
    }
    idx = found + 1;
  }
  return -1;
}
