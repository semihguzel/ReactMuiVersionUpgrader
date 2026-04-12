/**
 * Adds explicit underline="hover" to Link components that don't already have
 * an underline prop.
 *
 * In v4, Link default underline was "hover".
 * In v5, Link default underline changed to "always".
 * To preserve v4 behavior, we add explicit underline="hover".
 */
export function transformLinkUnderline(source, filePath) {
  let changed = false;
  const changes = [];
  let result = source;

  // Check if file uses Link from MUI
  if (!result.includes('Link')) return { source, changed: false, changes: [] };
  const hasMuiLink = /import\s+.*\bLink\b.*from\s+['"]@(?:material-ui\/core|mui\/material)/.test(result);
  if (!hasMuiLink) return { source, changed: false, changes: [] };

  // Match Link JSX tags without underline prop
  const tagPattern = /(<Link\b)([^>]*?)(\/?>)/g;

  result = result.replace(tagPattern, (match, tagStart, attrs, tagEnd) => {
    if (/\bunderline\s*=/.test(attrs)) return match;

    changed = true;
    changes.push({
      type: 'add-default-underline',
      component: 'Link',
      value: 'hover',
    });

    return `${tagStart}${attrs} underline="hover"${tagEnd}`;
  });

  return { source: result, changed, changes };
}
