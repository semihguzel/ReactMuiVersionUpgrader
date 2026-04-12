import { jssToGlobalClass } from '../../data/jssClassMappings.js';

/**
 * Transforms JSS pseudo-class selectors to MUI global class selectors.
 *
 * v4 (JSS): '&$focused', '& $disabled', '$selected'
 * v5 (emotion): '&.Mui-focused', '& .Mui-disabled', '.Mui-selected'
 *
 * Works on string literals within makeStyles, withStyles, createStyles,
 * and styled() calls.
 */
export function transformJssClasses(source, filePath) {
  let changed = false;
  const changes = [];
  let result = source;

  // Check if file has JSS-related code
  const hasJss = /(?:makeStyles|withStyles|createStyles)\s*\(/.test(result) ||
    /\$(?:focused|disabled|error|selected|checked|expanded|active|completed|readOnly|required|focusVisible)/.test(result);

  if (!hasJss) return { source, changed: false, changes: [] };

  for (const [jssClass, globalClass] of Object.entries(jssToGlobalClass)) {
    // Pattern 1: &$ruleName → &.Mui-ruleName (adjacent)
    const adjacentPattern = new RegExp(
      `&\\${jssClass}\\b`,
      'g'
    );
    const before1 = result;
    result = result.replace(adjacentPattern, `&.${globalClass}`);
    if (result !== before1) {
      changed = true;
      changes.push({
        type: 'jss-class-replace',
        from: `&${jssClass}`,
        to: `&.${globalClass}`,
      });
    }

    // Pattern 2: & $ruleName → & .Mui-ruleName (descendant)
    const descendantPattern = new RegExp(
      `(\\s)\\${jssClass}\\b`,
      'g'
    );
    const before2 = result;
    result = result.replace(descendantPattern, `$1.${globalClass}`);
    if (result !== before2) {
      changed = true;
      changes.push({
        type: 'jss-class-replace',
        from: `$${jssClass.substring(1)}`,
        to: `.${globalClass}`,
      });
    }

    // Pattern 3: '$ruleName' at start of a selector string (in quotes)
    const startPattern = new RegExp(
      `(['"])\\${jssClass}\\b`,
      'g'
    );
    const before3 = result;
    result = result.replace(startPattern, `$1.${globalClass}`);
    if (result !== before3) {
      changed = true;
    }
  }

  return { source: result, changed, changes };
}
