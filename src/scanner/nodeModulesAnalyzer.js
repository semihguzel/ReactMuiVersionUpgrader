/**
 * Scans the target project's node_modules to find any installed package
 * that has a hard dependency (dependencies or peerDependencies) on
 * @material-ui/core — i.e. packages that will break after a MUI v4→v5 migration.
 *
 * This lets us surface ALL incompatible transitive packages upfront instead
 * of discovering them one by one when the build fails.
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const MUI_V4_PACKAGES = [
  '@material-ui/core',
  '@material-ui/icons',
  '@material-ui/lab',
  '@material-ui/styles',
  '@material-ui/system',
  '@material-ui/utils',
];

/**
 * For each direct dependency of the target project, reads its package.json
 * from node_modules and checks whether it depends on any MUI v4 package.
 *
 * Only direct dependencies are checked (one level deep). Transitive
 * dependencies that aren't in the project's own package.json are unlikely
 * to be imported directly by the user's code, so surfacing them would be
 * noisy. The most common problem packages ARE direct deps.
 *
 * @param {string}   targetPath      Root of the target project.
 * @param {string[]} directDepNames  Names of the project's direct dependencies.
 * @returns {AutoDetectedPackage[]}
 */
export function detectMuiV4Dependents(targetPath, directDepNames) {
  const nodeModulesDir = join(targetPath, 'node_modules');
  if (!existsSync(nodeModulesDir)) return [];

  const results = [];

  for (const depName of directDepNames) {
    const pkgJsonPath = join(nodeModulesDir, depName, 'package.json');
    if (!existsSync(pkgJsonPath)) continue;

    let pkgJson;
    try {
      pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));
    } catch {
      continue;
    }

    const allDeps = {
      ...pkgJson.dependencies,
      ...pkgJson.peerDependencies,
    };

    for (const muiPkg of MUI_V4_PACKAGES) {
      if (allDeps[muiPkg]) {
        results.push({
          name: depName,
          installedVersion: pkgJson.version,
          dependsOn: muiPkg,
          requiredVersion: allDeps[muiPkg],
          isDep: !!pkgJson.dependencies?.[muiPkg],
          isPeer: !!pkgJson.peerDependencies?.[muiPkg],
        });
        break; // one match per package is enough
      }
    }
  }

  return results;
}

/**
 * @typedef {Object} AutoDetectedPackage
 * @property {string}  name              Package name.
 * @property {string}  installedVersion  Installed version string.
 * @property {string}  dependsOn         Which MUI v4 package it requires.
 * @property {string}  requiredVersion   The version range it requires.
 * @property {boolean} isDep             True if listed under dependencies.
 * @property {boolean} isPeer            True if listed under peerDependencies.
 */
