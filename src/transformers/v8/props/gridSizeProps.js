/**
 * Transformer: Grid breakpoint props → `size` prop (Material UI v9)
 *
 * In Material UI v9, the individual breakpoint props on Grid were removed.
 * They are replaced by a single `size` prop that accepts an object or number.
 *
 * Before:
 *   <Grid xs={12} sm={6} md={4} lg={3} xl={2}>
 *
 * After:
 *   <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}>
 *
 * Also handles boolean shorthand:
 *   <Grid xs>  →  <Grid size={{ xs: true }}>
 *
 * Limitation: only handles JSX attribute syntax (value={expr} or bare name).
 * Complex expressions (variables, ternary) are converted literally.
 */

const BREAKPOINTS = ['xs', 'sm', 'md', 'lg', 'xl'];

export function transformGridSizeProps(source, filePath) {
  const changes = [];
  const warnings = [];
  let modified = source;
  let changed = false;

  // Quick check — does this file mention Grid and any breakpoint prop?
  const hasGrid = /\bGrid\b/.test(modified);
  const hasBreakpointProp = BREAKPOINTS.some(bp =>
    new RegExp(`\\b${bp}(?:=|\\s*/>|\\s*>|\\s+)`).test(modified)
  );

  if (!hasGrid || !hasBreakpointProp) {
    return { source: modified, changed, changes, warnings };
  }

  /**
   * Match a single JSX opening tag (including self-closing) for <Grid ...>.
   * Regex captures everything from <Grid to the matching > or />.
   * We process each tag independently.
   */
  const gridTagRegex = /<Grid(\s[^>]*?)(\s*\/?>)/g;

  modified = modified.replace(gridTagRegex, (fullMatch, attrs, closing) => {
    const collectedBreakpoints = {};
    let newAttrs = attrs;
    let tagChanged = false;

    for (const bp of BREAKPOINTS) {
      // Matches:  bp={expr}  or  bp  (boolean true shorthand)
      const withValueRegex = new RegExp(
        `\\s+${bp}=(?:\\{([^}]*)\\}|"([^"]*)"|(\\S+))`, 'g'
      );
      const booleanRegex = new RegExp(`\\s+${bp}(?=[\\s/>])`, 'g');

      if (withValueRegex.test(newAttrs)) {
        newAttrs = newAttrs.replace(
          new RegExp(`\\s+${bp}=(?:\\{([^}]*)\\}|"([^"]*)"|(\\S+))`, 'g'),
          (m, curly, quoted, plain) => {
            const val = curly !== undefined ? curly : (quoted !== undefined ? quoted : plain);
            collectedBreakpoints[bp] = val;
            tagChanged = true;
            return '';
          }
        );
      } else if (booleanRegex.test(newAttrs)) {
        newAttrs = newAttrs.replace(
          new RegExp(`\\s+${bp}(?=[\\s/>])`, 'g'),
          () => {
            collectedBreakpoints[bp] = 'true';
            tagChanged = true;
            return '';
          }
        );
      }
    }

    if (!tagChanged) return fullMatch;

    // Build the size prop value
    const entries = Object.entries(collectedBreakpoints);
    let sizeProp;
    if (entries.length === 1 && (entries[0][1] === 'true' || entries[0][1] === 'false')) {
      sizeProp = `size={{ ${entries[0][0]}: ${entries[0][1]} }}`;
    } else if (entries.length === 1 && !isNaN(Number(entries[0][1]))) {
      sizeProp = `size={${entries[0][1]}}`;
    } else {
      const inner = entries.map(([k, v]) => `${k}: ${v}`).join(', ');
      sizeProp = `size={{ ${inner} }}`;
    }

    changes.push({
      type: 'prop-merge',
      from: Object.keys(collectedBreakpoints).join(', '),
      to: sizeProp,
    });

    return `<Grid${newAttrs} ${sizeProp}${closing}`;
  });

  if (modified !== source) {
    changed = true;
    warnings.push(
      `${filePath}: Grid breakpoint props (xs/sm/md/lg/xl) merged into \`size\` prop. ` +
      'Verify that container Grids without breakpoints still work correctly. ' +
      'See: https://mui.com/material-ui/migration/upgrade-to-v9/#grid'
    );
  }

  return { source: modified, changed, changes, warnings };
}
