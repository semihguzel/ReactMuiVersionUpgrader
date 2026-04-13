/**
 * JSX opening-tag boundary parser.
 *
 * Regex-based approaches use `[^>]*?` to match JSX attributes, but that
 * breaks on any `>` inside an attribute value — most commonly arrow functions:
 *
 *   <TextField onChange={(e) => handler(e)} />
 *                               ^--- regex stops here, mangling the output
 *
 * This module provides `findJSXTagEnd`, which walks the source character by
 * character while correctly tracking:
 *   - Curly-brace expression depth  `{…}`  (including nested `{{…}}`)
 *   - Quoted string literals          `"…"` / `'…'`
 *   - Template literals               `` `…` ``
 *
 * Only a `>` or `/>` that appears at brace-depth 0 and outside any string is
 * treated as the real end of the JSX opening tag.
 */

/**
 * Scans `source` starting at `pos` (the character immediately after the
 * component name in a JSX opening tag) and returns the tag-end boundaries.
 *
 * @param {string} source
 * @param {number} pos  — index of the first character after `<ComponentName`
 * @returns {{ closeStart: number, closeEnd: number } | null}
 *   closeStart — index of the first char of `/>` or `>`
 *   closeEnd   — index just past the last char of `/>` or `>`
 *   Returns null if no valid tag end is found (malformed source).
 */
export function findJSXTagEnd(source, pos) {
  let i = pos;
  let braceDepth = 0;

  while (i < source.length) {
    const ch = source[i];

    if (braceDepth > 0) {
      // Inside a JSX expression — track sub-braces and strings, ignore `>`
      if (ch === '{') {
        braceDepth++;
        i++;
      } else if (ch === '}') {
        braceDepth--;
        i++;
      } else if (ch === '"' || ch === "'") {
        i = skipQuotedString(source, i);
      } else if (ch === '`') {
        i = skipTemplateLiteral(source, i);
      } else {
        i++;
      }
    } else {
      // Outside braces — look for tag end or attribute start
      if (ch === '{') {
        braceDepth++;
        i++;
      } else if (ch === '"' || ch === "'") {
        i = skipQuotedString(source, i);
      } else if (ch === '`') {
        i = skipTemplateLiteral(source, i);
      } else if (ch === '/' && i + 1 < source.length && source[i + 1] === '>') {
        return { closeStart: i, closeEnd: i + 2 };
      } else if (ch === '>') {
        return { closeStart: i, closeEnd: i + 1 };
      } else {
        i++;
      }
    }
  }

  return null; // malformed / no end found
}

/**
 * Scans all JSX opening tags for `componentName` in `source`.
 * For each tag found, yields `{ attrStart, attrText, closeStart, closeEnd }`:
 *   attrStart  — index of the first character of the attribute region
 *   attrText   — the raw attribute string (between tag name and `>` / `/>`)
 *   closeStart — start of the closing `>` or `/>`
 *   closeEnd   — end of the closing `>` or `/>`
 *
 * @param {string} source
 * @param {string} componentName  — e.g. 'TextField'
 * @yields {{ tagStart: number, attrStart: number, attrText: string, closeStart: number, closeEnd: number }}
 */
export function* scanJSXTags(source, componentName) {
  const tagOpenRe = new RegExp(`<${componentName}\\b`, 'g');
  let match;

  while ((match = tagOpenRe.exec(source)) !== null) {
    const tagStart = match.index;
    const attrStart = tagStart + match[0].length;
    const end = findJSXTagEnd(source, attrStart);
    if (!end) continue;

    yield {
      tagStart,
      attrStart,
      attrText: source.slice(attrStart, end.closeStart),
      closeStart: end.closeStart,
      closeEnd: end.closeEnd,
    };

    // Advance past this tag so we don't re-examine it
    tagOpenRe.lastIndex = end.closeEnd;
  }
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function skipQuotedString(source, pos) {
  const quote = source[pos];
  let i = pos + 1;
  while (i < source.length) {
    if (source[i] === '\\') {
      i += 2; // skip escaped character
    } else if (source[i] === quote) {
      return i + 1; // past closing quote
    } else {
      i++;
    }
  }
  return i;
}

function skipTemplateLiteral(source, pos) {
  let i = pos + 1;
  while (i < source.length) {
    if (source[i] === '\\') {
      i += 2;
    } else if (source[i] === '`') {
      return i + 1;
    } else {
      i++;
    }
  }
  return i;
}
