import { v7PackageVersions } from '../data/v7/packageMappings.js';

/**
 * Bumps @mui/* packages from v6 to their v7 target versions.
 * No renames — all package names stay the same in v6→v7.
 * MUI X packages are excluded from the version bump (separate versioning).
 */
export function migrateV7CorePackages(packageJson, scanResult) {
  const changes = [];
  const warnings = [];
  const modified = JSON.parse(JSON.stringify(packageJson));

  for (const pkg of scanResult.muiV6Packages) {
    const depKey = pkg.isDev ? 'devDependencies' : 'dependencies';
    const pkgName = pkg.name;
    const targetVersion = pkg.targetVersion || v7PackageVersions[pkgName];

    // Skip MUI X packages — they're not bumped by this migrator
    if (!targetVersion) continue;

    if (modified[depKey]?.[pkgName]) {
      const oldVersion = modified[depKey][pkgName];
      modified[depKey][pkgName] = targetVersion;
      changes.push({
        type: 'version-upgrade',
        package: pkgName,
        from: oldVersion,
        to: targetVersion,
      });
    }
  }

  // Propagate TypeScript warning from scanner if present
  const tsWarning = scanResult.warnings?.find(w => w.includes('TypeScript'));
  if (tsWarning) {
    warnings.push(tsWarning);
  }

  return { packageJson: modified, changes, warnings };
}
