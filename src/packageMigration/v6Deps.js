import { v6PackageVersions } from '../data/v6/packageMappings.js';

/**
 * Bumps @mui/* packages from v5 to their v6/v7 target versions.
 * No renames — all package names stay the same in v5→v6.
 */
export function migrateV6CorePackages(packageJson, scanResult) {
  const changes = [];
  const warnings = [];
  const modified = JSON.parse(JSON.stringify(packageJson));

  for (const pkg of scanResult.muiV5Packages) {
    const depKey = pkg.isDev ? 'devDependencies' : 'dependencies';
    const pkgName = pkg.name;
    const targetVersion = pkg.targetVersion || v6PackageVersions[pkgName];

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

  // Warn if TypeScript is present but below 4.7
  const tsWarning = scanResult.warnings?.find(w => w.includes('TypeScript'));
  if (tsWarning) {
    warnings.push(tsWarning);
  }

  return { packageJson: modified, changes, warnings };
}
