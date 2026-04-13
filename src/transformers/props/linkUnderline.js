/**
 * Adds explicit underline="hover" to Link components that don't already have
 * an underline prop.
 *
 * In v4, Link default underline was "hover".
 * In v5, Link default underline changed to "always".
 * To preserve v4 behavior, we add explicit underline="hover".
 */
import { scanJSXTags } from '../utils/jsxTagParser.js';

export function transformLinkUnderline(source, filePath) {
  let changed = false;
  const changes = [];
  let result = source;

  if (!result.includes('Link')) return { source, changed: false, changes: [] };
  const hasMuiLink = /import\s+.*\bLink\b.*from\s+['"]@(?:material-ui\/core|mui\/material)/.test(result);
  if (!hasMuiLink) return { source, changed: false, changes: [] };

  const insertions = [];

  for (const tag of scanJSXTags(result, 'Link')) {
    if (/\bunderline\s*=/.test(tag.attrText)) continue;
    insertions.push(tag.closeStart);
  }

  for (let i = insertions.length - 1; i >= 0; i--) {
    const pos = insertions[i];
    result = result.slice(0, pos) + ' underline="hover"' + result.slice(pos);
    changed = true;
  }

  if (insertions.length > 0) {
    changes.push({ type: 'add-default-underline', component: 'Link', value: 'hover' });
  }

  return { source: result, changed, changes };
}
