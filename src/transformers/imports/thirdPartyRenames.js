/**
 * Renames import paths for third-party packages that were replaced by a
 * different package name as part of the MUI v4 → v5 migration.
 *
 * For example:
 *   import { fieldToTextField } from 'formik-material-ui'
 *   →
 *   import { fieldToTextField } from 'formik-mui'
 *
 * The source of truth is thirdPartyMappings — only entries that have a
 * `replacedBy` field trigger an import rename.
 */
import { thirdPartyMappings } from '../../data/thirdPartyMappings.js';

// Build the rename table once at module load time
const importRenames = Object.entries(thirdPartyMappings)
  .filter(([, mapping]) => mapping.replacedBy)
  .map(([oldPkg, mapping]) => ({ oldPkg, newPkg: mapping.replacedBy }));

export function transformThirdPartyRenames(source, filePath) {
  let changed = false;
  const changes = [];
  let result = source;

  for (const { oldPkg, newPkg } of importRenames) {
    if (!result.includes(oldPkg)) continue;

    const escapedOld = oldPkg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Match the package name in quotes, optionally followed by a sub-path
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
