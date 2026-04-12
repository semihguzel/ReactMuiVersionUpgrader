import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { packageMappings } from '../data/packageMappings.js';
import { thirdPartyMappings } from '../data/thirdPartyMappings.js';

/**
 * Analyzes the target project's package.json to detect MUI v4 dependencies
 * and third-party packages that need upgrading.
 */
export function analyzePackageJson(targetPath) {
  const packageJsonPath = join(targetPath, 'package.json');

  if (!existsSync(packageJsonPath)) {
    throw new Error(`package.json not found at ${packageJsonPath}`);
  }

  const raw = readFileSync(packageJsonPath, 'utf-8');
  const packageJson = JSON.parse(raw);

  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  const result = {
    packageJsonPath,
    raw,
    packageJson,
    muiV4Packages: [],
    thirdPartyPackages: [],
    alreadyMigratedPackages: [],
    hasEmotion: false,
    warnings: [],
  };

  // Detect MUI v4 packages
  for (const [v4Name, v5Name] of Object.entries(packageMappings)) {
    if (allDeps[v4Name]) {
      result.muiV4Packages.push({
        name: v4Name,
        currentVersion: allDeps[v4Name],
        newName: v5Name,
        isDev: !!packageJson.devDependencies?.[v4Name],
      });
    }
  }

  // Check if already partially migrated (v5 packages present)
  const v5Packages = Object.values(packageMappings);
  for (const v5Name of v5Packages) {
    if (allDeps[v5Name]) {
      result.alreadyMigratedPackages.push({
        name: v5Name,
        version: allDeps[v5Name],
      });
    }
  }

  if (result.alreadyMigratedPackages.length > 0 && result.muiV4Packages.length > 0) {
    result.warnings.push(
      'Project appears to be partially migrated: both v4 and v5 MUI packages detected.'
    );
  }

  // Check for emotion
  result.hasEmotion =
    !!allDeps['@emotion/react'] && !!allDeps['@emotion/styled'];

  // Detect third-party packages that need upgrading
  for (const [pkgName, mapping] of Object.entries(thirdPartyMappings)) {
    if (allDeps[pkgName] && !packageMappings[pkgName]) {
      result.thirdPartyPackages.push({
        name: pkgName,
        currentVersion: allDeps[pkgName],
        ...mapping,
        isDev: !!packageJson.devDependencies?.[pkgName],
      });
    }
  }

  // Warn about unknown MUI-related packages
  for (const depName of Object.keys(allDeps)) {
    if (
      depName.includes('material-ui') &&
      !packageMappings[depName] &&
      !thirdPartyMappings[depName]
    ) {
      result.warnings.push(
        `Unknown @material-ui related package: ${depName}. Manual review needed.`
      );
    }
  }

  return result;
}
