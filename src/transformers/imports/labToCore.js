import { labToCoreComponents, labToCoreHooks, labToCoreTypes } from '../../data/labToCoreMappings.js';

const allLabToCore = new Set([
  ...labToCoreComponents,
  ...labToCoreHooks,
  ...labToCoreTypes,
]);

/**
 * Transforms imports of components that moved from @material-ui/lab (now @mui/lab) to @mui/material.
 *
 * Examples:
 *   import { Alert, Skeleton } from '@mui/lab'       → split into @mui/material
 *   import { Alert, TabPanel } from '@mui/lab'        → Alert to @mui/material, TabPanel stays
 *   import Alert from '@mui/lab/Alert'                → import Alert from '@mui/material/Alert'
 */
export function transformLabToCore(source, filePath) {
  let changed = false;
  const changes = [];
  let result = source;

  // Handle deep imports: import X from '@mui/lab/ComponentName'
  // Also handles: import { default as X } patterns
  for (const componentName of allLabToCore) {
    const deepPattern = new RegExp(
      `(['"])@mui/lab/${componentName}(['"])`,
      'g'
    );
    result = result.replace(deepPattern, (match, q1, q2) => {
      changed = true;
      changes.push({
        type: 'lab-to-core',
        component: componentName,
        from: `@mui/lab/${componentName}`,
        to: `@mui/material/${componentName}`,
      });
      return `${q1}@mui/material/${componentName}${q2}`;
    });

    // Also handle old @material-ui/lab paths (in case packageRename hasn't run yet)
    const oldDeepPattern = new RegExp(
      `(['"])@material-ui/lab/${componentName}(['"])`,
      'g'
    );
    result = result.replace(oldDeepPattern, (match, q1, q2) => {
      changed = true;
      changes.push({
        type: 'lab-to-core',
        component: componentName,
        from: `@material-ui/lab/${componentName}`,
        to: `@mui/material/${componentName}`,
      });
      return `${q1}@mui/material/${componentName}${q2}`;
    });
  }

  // Handle barrel imports: import { Alert, Skeleton, TabPanel } from '@mui/lab'
  // Need to split: Alert, Skeleton → @mui/material; TabPanel stays in @mui/lab
  const barrelPattern = /import\s+(type\s+)?(\{[^}]+\})\s+from\s+(['"])(@mui\/lab|@material-ui\/lab)(['"])\s*;?/g;

  result = result.replace(barrelPattern, (match, typeKeyword, specifiers, q1, pkg, q2) => {
    const typePrefix = typeKeyword || '';
    // Parse specifiers: { Alert, Skeleton as Sk, TabPanel }
    const specList = specifiers
      .replace(/[{}]/g, '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const coreSpecs = [];
    const labSpecs = [];

    for (const spec of specList) {
      // Handle aliased imports: "Alert as MyAlert"
      const baseName = spec.split(/\s+as\s+/)[0].trim();
      if (allLabToCore.has(baseName)) {
        coreSpecs.push(spec);
      } else {
        labSpecs.push(spec);
      }
    }

    if (coreSpecs.length === 0) return match; // Nothing to move

    changed = true;
    changes.push({
      type: 'lab-to-core-barrel',
      moved: coreSpecs,
      remaining: labSpecs,
    });

    const lines = [];

    // Import for @mui/material
    lines.push(
      `import ${typePrefix}{ ${coreSpecs.join(', ')} } from ${q1}@mui/material${q2};`
    );

    // Keep remaining in @mui/lab (if any)
    if (labSpecs.length > 0) {
      lines.push(
        `import ${typePrefix}{ ${labSpecs.join(', ')} } from ${q1}@mui/lab${q2};`
      );
    }

    return lines.join('\n');
  });

  return { source: result, changed, changes };
}
