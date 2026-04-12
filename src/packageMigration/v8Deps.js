import {
  v8PackageVersions,
  v8LicenseRequiringPackages,
  v8LicensePackage,
} from '../data/v8/packageMappings.js';

/**
 * Bumps all detected v7 @mui/* packages to their v8/v9 targets and, when
 * a pro or premium MUI X package is present, adds `@mui/x-license`.
 *
 * @param {object} packageJson  Parsed package.json object
 * @param {object} scanResult   Result from analyzeForV8()
 * @returns {{ packageJson: object, changes: Array, warnings: Array }}
 */
export function migrateV8CorePackages(packageJson, scanResult) {
  const changes = [];
  const warnings = [];
  const modified = JSON.parse(JSON.stringify(packageJson));

  for (const pkg of scanResult.muiV7Packages || []) {
    const depKey = pkg.isDev ? 'devDependencies' : 'dependencies';
    const pkgName = pkg.name;
    const targetVersion = pkg.targetVersion || v8PackageVersions[pkgName];

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

  // Add @mui/x-license when a pro/premium package is present and the
  // license package itself isn't already listed.
  const allDeps = {
    ...(modified.dependencies || {}),
    ...(modified.devDependencies || {}),
  };

  const needsLicense = v8LicenseRequiringPackages.some(pkg => allDeps[pkg]);
  const alreadyHasLicense = !!allDeps[v8LicensePackage.name];

  if (needsLicense && !alreadyHasLicense) {
    if (!modified.dependencies) modified.dependencies = {};
    modified.dependencies[v8LicensePackage.name] = v8LicensePackage.version;
    changes.push({
      type: 'package-add',
      package: v8LicensePackage.name,
      to: v8LicensePackage.version,
      reason: 'Required for MUI X v8 pro/premium license activation',
    });
    warnings.push(
      `Added ${v8LicensePackage.name}@${v8LicensePackage.version}. ` +
      'Call LicenseInfo.setLicenseKey() from this package in your app entry point. ' +
      'See: https://mui.com/x/introduction/licensing/'
    );
  }

  return { packageJson: modified, changes, warnings };
}
