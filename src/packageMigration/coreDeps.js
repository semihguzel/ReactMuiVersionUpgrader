import { packageMappings, packageVersions } from '../data/packageMappings.js';

/**
 * Migrates MUI v4 package names to v5 in package.json.
 * Returns the modified package.json object and a list of changes.
 */
export function migrateCorePackages(packageJson, scanResult) {
  const changes = [];
  const modified = JSON.parse(JSON.stringify(packageJson));

  for (const pkg of scanResult.muiV4Packages) {
    const depKey = pkg.isDev ? 'devDependencies' : 'dependencies';
    const newName = packageMappings[pkg.name];
    const newVersion = packageVersions[newName] || '^5.0.0';

    // Remove old package
    if (modified[depKey]?.[pkg.name]) {
      delete modified[depKey][pkg.name];
    }

    // Add new package (skip if already exists from partial migration)
    if (!modified.dependencies?.[newName] && !modified.devDependencies?.[newName]) {
      if (!modified[depKey]) modified[depKey] = {};
      modified[depKey][newName] = newVersion;
    }

    changes.push({
      type: 'package-rename',
      from: `${pkg.name}@${pkg.currentVersion}`,
      to: `${newName}@${newVersion}`,
    });
  }

  return { packageJson: modified, changes };
}
