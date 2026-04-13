/**
 * Renames import paths for third-party packages that were replaced by a
 * different package name as part of the MUI v4 → v5 migration.
 *
 * Simple rename (same export shape):
 *   import { fieldToTextField } from 'formik-material-ui'
 *   → import { fieldToTextField } from 'formik-mui'
 *
 * Default → named export (defaultToNamed field):
 *   import ChipInput from 'material-ui-chip-input'
 *   → import { MuiChipsInput as ChipInput } from 'mui-chips-input'
 *
 *   If the local name already matches the new export name:
 *   import MuiChipsInput from 'material-ui-chip-input'
 *   → import { MuiChipsInput } from 'mui-chips-input'
 */
import { thirdPartyMappings } from '../../data/thirdPartyMappings.js';

// Build the rename table once at module load time
const importRenames = Object.entries(thirdPartyMappings)
  .filter(([, mapping]) => mapping.replacedBy)
  .map(([oldPkg, mapping]) => ({
    oldPkg,
    newPkg: mapping.replacedBy,
    defaultToNamed: mapping.defaultToNamed || null,
  }));

export function transformThirdPartyRenames(source, filePath) {
  let changed = false;
  const changes = [];
  let result = source;

  for (const { oldPkg, newPkg, defaultToNamed } of importRenames) {
    if (!result.includes(oldPkg)) continue;

    const escapedOld = oldPkg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // ── Step 1: rewrite default imports that need a named-export shape ────────
    if (defaultToNamed) {
      // Matches: import <localName> from '<oldPkg>'
      // Does NOT match: import { ... } from  (those are handled in step 2)
      const defaultImportRe = new RegExp(
        `import\\s+(\\w+)\\s+from\\s+(['"])${escapedOld}\\2\\s*;?`,
        'g'
      );

      result = result.replace(defaultImportRe, (match, localName, q) => {
        changed = true;
        const specifier =
          localName === defaultToNamed
            ? `{ ${defaultToNamed} }`
            : `{ ${defaultToNamed} as ${localName} }`;
        changes.push({
          type: 'third-party-default-to-named',
          from: `import ${localName} from '${oldPkg}'`,
          to: `import ${specifier} from '${newPkg}'`,
        });
        return `import ${specifier} from ${q}${newPkg}${q};`;
      });
    }

    // ── Step 2: rename the package path for all remaining import forms ────────
    // (named imports, dynamic imports, require calls, type imports)
    const pattern = new RegExp(`(['"])${escapedOld}(/[^'"]*)?(['"])`, 'g');

    result = result.replace(pattern, (match, q1, subpath, q2) => {
      const newFull = `${newPkg}${subpath || ''}`;
      changed = true;
      changes.push({ type: 'third-party-import-rename', from: oldPkg, to: newFull });
      return `${q1}${newFull}${q2}`;
    });
  }

  return { source: result, changed, changes };
}
