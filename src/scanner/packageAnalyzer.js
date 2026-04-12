import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { packageMappings } from '../data/packageMappings.js';
import { thirdPartyMappings } from '../data/thirdPartyMappings.js';
import { v5PackageNames, v6PackageVersions, v6PeerRequirements } from '../data/v6/packageMappings.js';
import { v6PackageNamesForV7, v7PackageVersions, v7PeerRequirements } from '../data/v7/packageMappings.js';
import { v7PackageNamesForV8, v8PackageVersions, v8PeerRequirements } from '../data/v8/packageMappings.js';

/**
 * Analyzes the target project's package.json to detect MUI v4 dependencies
 * and third-party packages that need upgrading.
 *
 * @param {string} targetPath
 * @param {'v4-to-v5'|'v5-to-v6'} migrationVersion
 */
export function analyzePackageJson(targetPath, migrationVersion = 'v4-to-v5') {
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

  if (migrationVersion === 'v7-to-v8') {
    return analyzeForV8(packageJsonPath, raw, packageJson, allDeps);
  }
  if (migrationVersion === 'v6-to-v7') {
    return analyzeForV7(packageJsonPath, raw, packageJson, allDeps);
  }
  if (migrationVersion === 'v5-to-v6') {
    return analyzeForV6(packageJsonPath, raw, packageJson, allDeps);
  }
  return analyzeForV45(packageJsonPath, raw, packageJson, allDeps);
}

/**
 * v4 → v5 analysis (original logic).
 */
function analyzeForV45(packageJsonPath, raw, packageJson, allDeps) {
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

/**
 * v6 → v7 analysis: detects @mui/* packages at ^6.x.
 */
function analyzeForV7(packageJsonPath, raw, packageJson, allDeps) {
  const result = {
    packageJsonPath,
    raw,
    packageJson,
    muiV6Packages: [],
    alreadyMigratedPackages: [],
    warnings: [],
  };

  for (const pkgName of v6PackageNamesForV7) {
    if (!allDeps[pkgName]) continue;

    const currentVersion = allDeps[pkgName];
    const targetVersion = v7PackageVersions[pkgName];
    const isDev = !!packageJson.devDependencies?.[pkgName];

    // MUI X packages have no v7 target in this tool — skip bumping them
    if (!targetVersion) continue;

    const majorTarget = parseInt((targetVersion || '^7').replace(/[\^~>=<]/, ''), 10);
    const currentMajor = parseInt(currentVersion.replace(/[\^~>=<]/, ''), 10);

    if (!isNaN(currentMajor) && currentMajor >= majorTarget) {
      result.alreadyMigratedPackages.push({ name: pkgName, version: currentVersion });
    } else {
      result.muiV6Packages.push({ name: pkgName, currentVersion, targetVersion, isDev });
    }
  }

  if (result.alreadyMigratedPackages.length > 0 && result.muiV6Packages.length > 0) {
    result.warnings.push(
      'Project appears to be partially migrated: some packages are already at v7.'
    );
  }

  // TypeScript version check — v7 requires >= 4.9
  const tsVersion = allDeps['typescript'];
  if (tsVersion) {
    const tsMajorMinor = tsVersion.replace(/[\^~>=<]/, '').split('.').slice(0, 2).map(Number);
    const minRequired = v7PeerRequirements.typescript.replace('>=', '').split('.').map(Number);
    const [maj, min] = tsMajorMinor;
    const [reqMaj, reqMin] = minRequired;
    if (maj < reqMaj || (maj === reqMaj && min < reqMin)) {
      result.warnings.push(
        `TypeScript ${tsVersion} detected. MUI v7 requires TypeScript ${v7PeerRequirements.typescript}. Please upgrade.`
      );
    }
  }

  return result;
}

/**
 * v7 → v8/v9 analysis: detects @mui/* packages at ^7.x and MUI X at ^7.x.
 */
function analyzeForV8(packageJsonPath, raw, packageJson, allDeps) {
  const result = {
    packageJsonPath,
    raw,
    packageJson,
    muiV7Packages: [],
    alreadyMigratedPackages: [],
    warnings: [],
  };

  for (const pkgName of v7PackageNamesForV8) {
    if (!allDeps[pkgName]) continue;

    const currentVersion = allDeps[pkgName];
    const targetVersion = v8PackageVersions[pkgName];
    const isDev = !!packageJson.devDependencies?.[pkgName];

    if (!targetVersion) continue;

    const majorTarget = parseInt((targetVersion || '^8').replace(/[\^~>=<]/, ''), 10);
    const currentMajor = parseInt(currentVersion.replace(/[\^~>=<]/, ''), 10);

    if (!isNaN(currentMajor) && currentMajor >= majorTarget) {
      result.alreadyMigratedPackages.push({ name: pkgName, version: currentVersion });
    } else {
      result.muiV7Packages.push({ name: pkgName, currentVersion, targetVersion, isDev });
    }
  }

  if (result.alreadyMigratedPackages.length > 0 && result.muiV7Packages.length > 0) {
    result.warnings.push(
      'Project appears to be partially migrated: some packages are already at v8/v9.'
    );
  }

  // TypeScript version check — v8/v9 requires >= 5.0
  const tsVersion = allDeps['typescript'];
  if (tsVersion) {
    const tsMajorMinor = tsVersion.replace(/[\^~>=<]/, '').split('.').slice(0, 2).map(Number);
    const minRequired = v8PeerRequirements.typescript.replace('>=', '').split('.').map(Number);
    const [maj, min] = tsMajorMinor;
    const [reqMaj, reqMin] = minRequired;
    if (maj < reqMaj || (maj === reqMaj && (min ?? 0) < (reqMin ?? 0))) {
      result.warnings.push(
        `TypeScript ${tsVersion} detected. MUI v8/v9 requires TypeScript ${v8PeerRequirements.typescript}. Please upgrade.`
      );
    }
  }

  return result;
}

/**
 * v5 → v6 analysis: detects @mui/* packages at ^5.x.
 */
function analyzeForV6(packageJsonPath, raw, packageJson, allDeps) {
  const result = {
    packageJsonPath,
    raw,
    packageJson,
    muiV5Packages: [],
    alreadyMigratedPackages: [],
    warnings: [],
  };

  for (const pkgName of v5PackageNames) {
    if (!allDeps[pkgName]) continue;

    const currentVersion = allDeps[pkgName];
    const targetVersion = v6PackageVersions[pkgName];
    const isDev = !!packageJson.devDependencies?.[pkgName];

    // Check if already on v6 (or v7 for X packages)
    const majorTarget = parseInt((targetVersion || '^6').replace(/[\^~>=<]/, ''), 10);
    const currentMajor = parseInt(currentVersion.replace(/[\^~>=<]/, ''), 10);

    if (!isNaN(currentMajor) && currentMajor >= majorTarget) {
      result.alreadyMigratedPackages.push({ name: pkgName, version: currentVersion });
    } else {
      result.muiV5Packages.push({ name: pkgName, currentVersion, targetVersion, isDev });
    }
  }

  if (result.alreadyMigratedPackages.length > 0 && result.muiV5Packages.length > 0) {
    result.warnings.push(
      'Project appears to be partially migrated: some packages are already at v6/v7.'
    );
  }

  // TypeScript version check
  const tsVersion = allDeps['typescript'];
  if (tsVersion) {
    const tsMajorMinor = tsVersion.replace(/[\^~>=<]/, '').split('.').slice(0, 2).map(Number);
    const minRequired = v6PeerRequirements.typescript.replace('>=', '').split('.').map(Number);
    const [maj, min] = tsMajorMinor;
    const [reqMaj, reqMin] = minRequired;
    if (maj < reqMaj || (maj === reqMaj && min < reqMin)) {
      result.warnings.push(
        `TypeScript ${tsVersion} detected. MUI v6 requires TypeScript >= ${v6PeerRequirements.typescript}. Please upgrade.`
      );
    }
  }

  return result;
}
