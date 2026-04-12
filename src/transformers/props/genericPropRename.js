import { propRenames, transitionPropsMigration } from '../../data/propRenames.js';
import { packageMappings } from '../../data/packageMappings.js';

// Build a set of MUI import sources for detecting MUI components
const muiSources = new Set([
  ...Object.keys(packageMappings),
  ...Object.values(packageMappings),
]);

/**
 * Data-driven prop rename transformer.
 * Reads propRenames.js config and applies all prop renames/value changes.
 *
 * Handles:
 *   - Prop name renames: justify → justifyContent
 *   - Prop value changes: variant="circle" → variant="circular"
 *   - Removed props: adds warning comment
 *   - Transition props migration to TransitionProps object
 */
export function transformGenericProps(source, filePath) {
  let changed = false;
  const changes = [];
  const warnings = [];
  let result = source;

  // First: detect which MUI components are imported in this file
  const importedComponents = detectImportedMuiComponents(result);

  if (importedComponents.size === 0) {
    return { source, changed: false, changes: [] };
  }

  // Apply prop renames for each imported component
  for (const [componentName, propRules] of Object.entries(propRenames)) {
    // Check if this component (or alias) is used in this file
    const localName = importedComponents.get(componentName);
    if (!localName) continue;

    for (const [propName, rule] of Object.entries(propRules)) {
      if (!rule || Object.keys(rule).length === 0) continue;

      // Prop name rename: e.g., justify → justifyContent
      if (rule.renameTo) {
        const propPattern = new RegExp(
          `(<${localName}[\\s\\S]*?)\\b${propName}(\\s*=)`,
          'g'
        );
        const beforeReplace = result;
        result = result.replace(propPattern, `$1${rule.renameTo}$2`);
        if (result !== beforeReplace) {
          changed = true;
          changes.push({
            type: 'prop-rename',
            component: componentName,
            from: propName,
            to: rule.renameTo,
          });
        }
      }

      // Prop value changes: e.g., variant="circle" → variant="circular"
      if (rule.valueChanges) {
        for (const [oldVal, newVal] of Object.entries(rule.valueChanges)) {
          // String literal: prop="oldValue"
          const strPattern = new RegExp(
            `(<${localName}[\\s\\S]*?\\b${rule.renameTo || propName}\\s*=\\s*)(['"])${oldVal}\\2`,
            'g'
          );
          const beforeReplace = result;
          result = result.replace(strPattern, `$1$2${newVal}$2`);
          if (result !== beforeReplace) {
            changed = true;
            changes.push({
              type: 'prop-value-change',
              component: componentName,
              prop: rule.renameTo || propName,
              from: oldVal,
              to: newVal,
            });
          }
        }
      }

      // Removed props: add warning
      if (rule.removed) {
        const removedPattern = new RegExp(
          `<${localName}[^>]*\\b${propName}\\b[^>]*>`,
        );
        if (removedPattern.test(result)) {
          warnings.push(
            `${componentName}: "${propName}" prop is removed in v5. ${rule.migration || 'Manual migration needed.'}`
          );
        }
      }
    }
  }

  // Transition props migration
  for (const componentName of transitionPropsMigration.components) {
    const localName = importedComponents.get(componentName);
    if (!localName) continue;

    for (const transitionProp of transitionPropsMigration.props) {
      const pattern = new RegExp(
        `(<${localName}[^>]*?)\\s+${transitionProp}=\\{([^}]+)\\}`,
        'g'
      );
      if (pattern.test(result)) {
        warnings.push(
          `${componentName}: "${transitionProp}" should be moved to TransitionProps object. ` +
          `Example: TransitionProps={{ ${transitionProp}: handler }}`
        );
      }
    }
  }

  return { source: result, changed, changes, warnings };
}

/**
 * Detects MUI components imported in the file.
 * Returns Map of ComponentName → localName (handles aliases).
 */
function detectImportedMuiComponents(source) {
  const components = new Map();

  // Match: import { Button, Grid as MyGrid } from '@mui/material'
  const barrelPattern = /import\s+(?:type\s+)?\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g;
  let match;

  while ((match = barrelPattern.exec(source)) !== null) {
    const importSource = match[2];
    // Check if it's an MUI source
    const isMui = [...muiSources].some(s => importSource.startsWith(s));
    if (!isMui) continue;

    const specifiers = match[1].split(',').map(s => s.trim()).filter(Boolean);
    for (const spec of specifiers) {
      const parts = spec.split(/\s+as\s+/);
      const originalName = parts[0].trim();
      const localName = (parts[1] || parts[0]).trim();
      components.set(originalName, localName);
    }
  }

  // Match: import Button from '@mui/material/Button'
  const defaultPattern = /import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g;
  while ((match = defaultPattern.exec(source)) !== null) {
    const localName = match[1];
    const importSource = match[2];
    const isMui = [...muiSources].some(s => importSource.startsWith(s));
    if (!isMui) continue;

    // Extract component name from path: @mui/material/Button → Button
    const parts = importSource.split('/');
    const componentName = parts[parts.length - 1];
    components.set(componentName, localName);
  }

  return components;
}
