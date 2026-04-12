/**
 * Removes RootRef usage and migrates to direct ref on child element.
 *
 * v4: <RootRef rootRef={myRef}><SomeComponent /></RootRef>
 * v5: <SomeComponent ref={myRef} />
 *
 * This is a complex transformation - adds warnings for manual review.
 */
export function transformRootRefRemoval(source, filePath) {
  let changed = false;
  const changes = [];
  const warnings = [];
  let result = source;

  if (!result.includes('RootRef')) {
    return { source, changed: false, changes: [], warnings: [] };
  }

  // Remove RootRef import
  // import { RootRef } from '@material-ui/core'  or  '@mui/material'
  const importPattern = /import\s+\{([^}]*)\}\s+from\s+(['"])(@material-ui\/core|@mui\/material)\2\s*;?/g;

  result = result.replace(importPattern, (match, specifiers, q, pkg) => {
    const specs = specifiers.split(',').map(s => s.trim()).filter(Boolean);
    const filtered = specs.filter(s => {
      const name = s.split(/\s+as\s+/)[0].trim();
      return name !== 'RootRef';
    });

    if (filtered.length === specs.length) return match; // RootRef not in this import

    changed = true;
    changes.push({ type: 'remove-import', component: 'RootRef' });

    if (filtered.length === 0) return ''; // Empty import, remove entirely
    return `import { ${filtered.join(', ')} } from ${q}${pkg}${q};`;
  });

  // Also handle default import: import RootRef from '@material-ui/core/RootRef'
  const defaultImportPattern = /import\s+\w+\s+from\s+(['"])(@material-ui\/core|@mui\/material)\/RootRef\1\s*;?\n?/g;
  result = result.replace(defaultImportPattern, () => {
    changed = true;
    changes.push({ type: 'remove-import', component: 'RootRef' });
    return '';
  });

  // Transform JSX usage:
  // <RootRef rootRef={ref}>{children}</RootRef> → add ref to child
  // This is best-effort; complex cases get a warning
  const jsxPattern = /<RootRef\s+rootRef=\{([^}]+)\}\s*>\s*([\s\S]*?)\s*<\/RootRef>/g;

  result = result.replace(jsxPattern, (match, refName, children) => {
    changed = true;
    const trimmedChildren = children.trim();

    // Simple case: single JSX child element
    const singleChildMatch = trimmedChildren.match(/^(<\w+)/);
    if (singleChildMatch) {
      // Add ref prop to the child
      const childWithRef = trimmedChildren.replace(
        /^(<\w+)/,
        `$1 ref={${refName}}`
      );
      changes.push({
        type: 'rootref-removal',
        ref: refName,
      });
      return childWithRef;
    }

    // Complex case: add warning
    warnings.push(
      `RootRef removal needs manual review at: ${filePath}. ` +
      `Move rootRef={${refName}} to child element's ref prop.`
    );
    changes.push({ type: 'rootref-removal-partial', ref: refName });

    return `{/* TODO: MUI v5 migration - RootRef removed. Move ref={${refName}} to child element */}\n${trimmedChildren}`;
  });

  return { source: result, changed, changes, warnings };
}
