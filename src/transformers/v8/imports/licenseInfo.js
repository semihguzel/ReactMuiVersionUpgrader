/**
 * Transformer: LicenseInfo import migration for MUI X v8
 *
 * In MUI X v8, LicenseInfo must be imported from the dedicated
 * `@mui/x-license` package instead of from individual product packages.
 *
 * Before:
 *   import { LicenseInfo } from '@mui/x-data-grid-pro';
 *   import { LicenseInfo } from '@mui/x-data-grid-premium';
 *
 * After:
 *   import { LicenseInfo } from '@mui/x-license';
 */

const SOURCE_PACKAGES = [
  '@mui/x-data-grid-pro',
  '@mui/x-data-grid-premium',
  '@mui/x-charts-pro',
  '@mui/x-date-pickers-pro',
  '@mui/x-tree-view-pro',
];

export function transformLicenseInfo(source, filePath) {
  const changes = [];
  const warnings = [];
  let modified = source;
  let changed = false;

  for (const pkg of SOURCE_PACKAGES) {
    // Match import statements that include LicenseInfo from this package.
    // Handles both named-only and mixed named imports.
    // e.g. import { LicenseInfo } from '@mui/x-data-grid-pro'
    // e.g. import { LicenseInfo, GridColDef } from '@mui/x-data-grid-pro'
    const importRegex = new RegExp(
      `(import\\s*\\{[^}]*\\bLicenseInfo\\b[^}]*\\}\\s*from\\s*)(['"])${escapeRegex(pkg)}\\2`,
      'g'
    );

    if (importRegex.test(modified)) {
      modified = modified.replace(
        new RegExp(
          `(import\\s*\\{[^}]*\\bLicenseInfo\\b[^}]*\\}\\s*from\\s*)(['"])${escapeRegex(pkg)}\\2`,
          'g'
        ),
        (match, importPart, quote) => `${importPart}${quote}@mui/x-license${quote}`
      );
      changes.push({
        type: 'import-source-change',
        from: pkg,
        to: '@mui/x-license',
        specifier: 'LicenseInfo',
      });
      changed = true;
    }
  }

  return { source: modified, changed, changes, warnings };
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
