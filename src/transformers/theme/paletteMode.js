/**
 * Renames theme.palette.type → theme.palette.mode
 *
 * v4: { palette: { type: 'dark' } }
 * v5: { palette: { mode: 'dark' } }
 *
 * Also handles:
 *   - theme.palette.type references in code
 *   - Destructuring: const { type } = theme.palette (adds warning)
 */
export function transformPaletteMode(source, filePath) {
  let changed = false;
  const changes = [];
  const warnings = [];
  let result = source;

  // Pattern 1: In object literals - palette: { type: 'dark' }
  // Match 'type' key in objects that look like palette config
  const objectPattern = /(\bpalette\s*:\s*\{[^}]*?)\btype(\s*:)/g;
  const before1 = result;
  result = result.replace(objectPattern, '$1mode$2');
  if (result !== before1) {
    changed = true;
    changes.push({
      type: 'theme-property-rename',
      from: 'palette.type',
      to: 'palette.mode',
    });
  }

  // Pattern 2: Property access - theme.palette.type or palette.type
  const accessPattern = /(\bpalette)\.type\b/g;
  const before2 = result;
  result = result.replace(accessPattern, '$1.mode');
  if (result !== before2) {
    changed = true;
    if (!changes.some(c => c.type === 'theme-property-rename')) {
      changes.push({
        type: 'theme-property-rename',
        from: 'palette.type',
        to: 'palette.mode',
      });
    }
  }

  // Pattern 3: Bracket access - palette['type'] or palette["type"]
  const bracketPattern = /(\bpalette)\[(['"])type\2\]/g;
  const before3 = result;
  result = result.replace(bracketPattern, '$1[$2mode$2]');
  if (result !== before3) {
    changed = true;
  }

  return { source: result, changed, changes, warnings };
}
