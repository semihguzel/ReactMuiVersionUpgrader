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
      const msg = pkg.autoDetected
        ? `${pkg.name}@${pkg.currentVersion}: ${pkg.notes}`
        : `${pkg.name}: No automatic migration available. ${pkg.notes || 'Manual review needed.'}`;
      warnings.push(msg);
    }

    // Enforce peer requirements declared by this package (e.g. devexpress needs @mui/x-date-pickers@^5)
    if (pkg.peerRequirements) {
      for (const [peerPkg, peerVersion] of Object.entries(pkg.peerRequirements)) {
        const currentInDeps = modified.dependencies?.[peerPkg];
        const currentInDev  = modified.devDependencies?.[peerPkg];
        const current = currentInDeps || currentInDev;

        const peerMajor    = parseInt(peerVersion.replace(/[\^~>=<]/, ''), 10);
        const currentMajor = current ? parseInt(current.replace(/[\^~>=<]/, ''), 10) : NaN;

        if (!isNaN(currentMajor) && currentMajor > peerMajor) {
          // Current version is too new — pin down to the peer requirement
          if (currentInDeps)  modified.dependencies[peerPkg]    = peerVersion;
          if (currentInDev)   modified.devDependencies[peerPkg] = peerVersion;

          changes.push({
            type: 'peer-requirement-pin',
            package: peerPkg,
            from: current,
            to: peerVersion,
            reason: `Required by ${pkg.name}`,
          });
        } else if (!current) {
          // Not present at all — add it
          if (!modified.dependencies) modified.dependencies = {};
          modified.dependencies[peerPkg] = peerVersion;

          changes.push({
            type: 'peer-requirement-add',
            package: peerPkg,
            to: peerVersion,
            reason: `Required by ${pkg.name}`,
          });
        }

        warnings.push(
          pkg.peerRequirementNotes ||
          `${pkg.name} requires ${peerPkg}@${peerVersion}. Version has been pinned.`
        );
      }
    }
  }

  return { packageJson: modified, changes, warnings };
}
