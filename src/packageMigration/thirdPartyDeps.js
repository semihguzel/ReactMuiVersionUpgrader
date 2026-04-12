/**
 * Upgrades third-party packages that depend on MUI to v5-compatible versions.
 */
export function migrateThirdPartyPackages(packageJson, scanResult) {
  const changes = [];
  const warnings = [];
  const modified = JSON.parse(JSON.stringify(packageJson));

  for (const pkg of scanResult.thirdPartyPackages) {
    const depKey = pkg.isDev ? 'devDependencies' : 'dependencies';

    // Package replaced by another
    if (pkg.replacedBy) {
      const newVersion = pkg.replacedVersion || pkg.targetVersion;
      if (modified[depKey]?.[pkg.name]) {
        delete modified[depKey][pkg.name];
      }
      if (!modified[depKey]) modified[depKey] = {};
      modified[depKey][pkg.replacedBy] = newVersion;

      changes.push({
        type: 'package-replace',
        from: `${pkg.name}@${pkg.currentVersion}`,
        to: `${pkg.replacedBy}@${newVersion}`,
        notes: pkg.notes,
      });
      continue;
    }

    // Package needs version upgrade
    if (pkg.targetVersion) {
      if (modified[depKey]?.[pkg.name]) {
        modified[depKey][pkg.name] = pkg.targetVersion;
      }

      changes.push({
        type: 'version-upgrade',
        package: pkg.name,
        from: pkg.currentVersion,
        to: pkg.targetVersion,
        notes: pkg.notes,
      });

      // Upgrade related packages
      if (pkg.relatedPackages) {
        for (const [relatedName, relatedVersion] of Object.entries(pkg.relatedPackages)) {
          // Find which dep group it's in
          if (modified.dependencies?.[relatedName]) {
            modified.dependencies[relatedName] = relatedVersion;
          } else if (modified.devDependencies?.[relatedName]) {
            modified.devDependencies[relatedName] = relatedVersion;
          } else {
            // Not found, add as dependency
            if (!modified[depKey]) modified[depKey] = {};
            modified[depKey][relatedName] = relatedVersion;
          }

          changes.push({
            type: 'related-upgrade',
            package: relatedName,
            to: relatedVersion,
            reason: `Required by ${pkg.name}`,
          });
        }
      }
    } else {
      warnings.push(
        `${pkg.name}: No automatic migration available. ${pkg.notes || 'Manual review needed.'}`
      );
    }
  }

  return { packageJson: modified, changes, warnings };
}
