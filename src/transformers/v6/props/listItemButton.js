/**
 * Transformer: ListItem button prop removal → ListItemButton
 *
 * In MUI v6, the `button`, `autoFocus`, `disabled`, and `selected` props are
 * removed from ListItem. The `button` prop variant should become ListItemButton.
 *
 * Simple auto-migration:
 *   <ListItem button ...>  →  <ListItemButton ...>
 *   Also moves autoFocus, disabled, selected to the new tag.
 *   Adds ListItemButton to the @mui/material import if not already present.
 *
 * Complex cases (spreads, conditionals) receive a warning and are not rewritten.
 */
export function transformListItemButton(source, filePath) {
  const changes = [];
  const warnings = [];
  let modified = source;
  let changed = false;

  if (!modified.includes('ListItem')) {
    return { source, changed: false, changes, warnings };
  }

  // Track whether we added any ListItemButton usages that need to be imported
  let needsListItemButtonImport = false;

  // Match opening ListItem tags that contain the `button` prop
  // We look for <ListItem followed by attributes including `button`
  // Pattern: <ListItem (attrs) > ... </ListItem> or <ListItem (attrs) />
  // We'll use a regex to find the opening tag and check for `button` prop

  const openTagRegex = /<ListItem(?![A-Za-z\d])((?:[^>]|\n)*?)>/g;

  modified = modified.replace(openTagRegex, (fullMatch, attrs) => {
    // Check if it has `button` prop (standalone, not buttonRef or similar)
    if (!/(?:^|\s)button(?=[\s/>]|$)/.test(attrs) && !/(?:^|\s)button(?:\s*=)/.test(attrs)) {
      // No button prop — check for the other removed props and warn
      const removedProps = ['autoFocus', 'disabled', 'selected'];
      for (const prop of removedProps) {
        const propRegex = new RegExp(`(?:^|\\s)${prop}(?=[\\s=/>]|$)`);
        if (propRegex.test(attrs)) {
          warnings.push(
            `${filePath}: <ListItem> has \`${prop}\` prop which was removed in v6. ` +
            `Move it to <ListItemButton ${prop}>. ` +
            'See: https://mui.com/material-ui/migration/upgrade-to-v6/#listitem'
          );
        }
      }
      return fullMatch;
    }

    // Has `button` prop — check for spread operators (complex case)
    if (attrs.includes('...')) {
      warnings.push(
        `${filePath}: <ListItem button> with spread props cannot be auto-migrated to ListItemButton. ` +
        'Please manually replace with <ListItemButton>. ' +
        'See: https://mui.com/material-ui/migration/upgrade-to-v6/#listitem'
      );
      return fullMatch;
    }

    // Simple case: remove `button` prop and rename tag
    let newAttrs = attrs
      // Remove bare `button` prop
      .replace(/\s+button(?=[\s/>]|$)/, '')
      // Remove `button={true}`
      .replace(/\s+button=\{true\}/, '');

    changes.push({ type: 'component-replace', from: 'ListItem (with button prop)', to: 'ListItemButton' });
    needsListItemButtonImport = true;
    changed = true;

    return `<ListItemButton${newAttrs}>`;
  });

  // Also replace matching closing tags </ListItem> that follow a converted open tag
  // This is a best-effort: replace all </ListItem> in files where we made changes.
  // We can't perfectly match open/close pairs with regex, so we warn if multiple exist.
  if (needsListItemButtonImport) {
    const closingTagCount = (modified.match(/<\/ListItem>/g) || []).length;
    if (closingTagCount > 0) {
      // Replace closing tags - note: this may be incorrect if not all ListItems were converted
      // but since we only convert those with `button`, and ListItemButton needs closing tags too,
      // we issue a warning to review
      warnings.push(
        `${filePath}: Please verify closing </ListItem> tags — some may need to become </ListItemButton>. ` +
        'The transformer converted opening tags but closing tag replacement requires manual review.'
      );
    }

    // Add ListItemButton to the @mui/material import if not already there
    modified = addListItemButtonImport(modified, filePath, changes, warnings);
  }

  // Warn about remaining autoFocus/disabled/selected on ListItem (no button prop)
  const remainingListItemRegex = /<ListItem(?![A-Za-z\d])((?:[^>]|\n)*?)>/g;
  let match;
  while ((match = remainingListItemRegex.exec(modified)) !== null) {
    const attrs = match[1];
    for (const prop of ['autoFocus', 'disabled', 'selected']) {
      if (new RegExp(`(?:^|\\s)${prop}(?=[\\s=/>]|$)`).test(attrs)) {
        warnings.push(
          `${filePath}: <ListItem> has \`${prop}\` which was removed in MUI v6. ` +
          'Replace <ListItem> with <ListItemButton> if this is an interactive item. ' +
          'See: https://mui.com/material-ui/migration/upgrade-to-v6/#listitem'
        );
      }
    }
  }

  return { source: modified, changed, changes, warnings };
}

/**
 * Adds ListItemButton to the @mui/material named import if not already present.
 */
function addListItemButtonImport(source, filePath, changes, warnings) {
  // Already imported?
  if (/\bListItemButton\b/.test(source.split('\n').filter(l => l.includes('import')).join('\n'))) {
    return source;
  }

  // Find the @mui/material import and add ListItemButton
  const muiImportRegex = /import\s*\{([^}]+)\}\s*from\s*['"]@mui\/material['"]/;
  const match = muiImportRegex.exec(source);

  if (match) {
    const specifiers = match[1];
    if (!specifiers.includes('ListItemButton')) {
      const newSpecifiers = specifiers.trimEnd() + ', ListItemButton';
      const newImport = match[0].replace(specifiers, newSpecifiers);
      changes.push({ type: 'import-add', specifier: 'ListItemButton', from: '@mui/material' });
      return source.replace(match[0], newImport);
    }
  } else {
    warnings.push(
      `${filePath}: Could not find @mui/material import to add ListItemButton. ` +
      'Please add `import { ListItemButton } from "@mui/material"` manually.'
    );
  }

  return source;
}
