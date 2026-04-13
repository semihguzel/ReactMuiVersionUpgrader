/**
 * Scans the target project's node_modules to find installed packages that
 * will break after a MUI version migration.
 *
 * v4→v5: any package that hard-depends on @material-ui/core / icons / lab / etc.
 * v5→v6, v6→v7, v7→v8: any package whose @mui/material peer dep is caret/tilde-
 *   locked to the source major (e.g. "^5.x.x" won't satisfy v6).
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

// All MUI v4 package names (v4→v5 check)
const MUI_V4_PACKAGES = [
  '@material-ui/core',
  '@material-ui/icons',
  '@material-ui/lab',
  '@material-ui/styles',
  '@material-ui/system',
  '@material-ui/utils',
];

// The primary MUI core package for v5+ (v5→v6, v6→v7, v7→v8 checks)
const MUI_CORE_PACKAGE = '@mui/material';

// ─── public API ───────────────────────────────────────────────────────────────

/**
 * v4→v5: detects packages that directly depend on any @material-ui/* package.
 *
 * @param {string}   targetPath      Root of the target project.
 * @param {string[]} directDepNames  Names of the project's direct dependencies.
 * @returns {AutoDetectedPackage[]}
 */
export function detectMuiV4Dependents(targetPath, directDepNames) {
  return _scan(targetPath, directDepNames, (_allDeps, pkgJson) => {
    const combined = { ...pkgJson.dependencies, ...pkgJson.peerDependencies };
    for (const muiPkg of MUI_V4_PACKAGES) {
      if (combined[muiPkg]) {
        return { dependsOn: muiPkg, requiredVersion: combined[muiPkg] };
      }
    }
    return null;
  });
}

/**
 * v5→v6, v6→v7, v7→v8: detects packages whose @mui/material peer dependency
 * is caret- or tilde-locked to `sourceMajor` and will therefore not satisfy
 * the next major version.
 *
 * Example: migrating v5→v6 (sourceMajor=5), a package with
 *   peerDependencies: { "@mui/material": "^5.0.0" }
 * will break because ^5 does not satisfy v6.
 *
 * Permissive ranges like ">=5.0.0" or "*" are NOT flagged — they satisfy v6+.
 *
 * @param {string}   targetPath      Root of the target project.
 * @param {string[]} directDepNames  Names of the project's direct dependencies.
 * @param {number}   sourceMajor     MUI major being migrated FROM (5, 6, or 7).
 * @returns {AutoDetectedPackage[]}
 */
export function detectMuiPeerDepIncompatible(targetPath, directDepNames, sourceMajor) {
  return _scan(targetPath, directDepNames, (_allDeps, pkgJson) => {
    const peerRange = pkgJson.peerDependencies?.[MUI_CORE_PACKAGE];
    if (!peerRange) return null;

    // Extract the leading major number from the range
    const match = peerRange.match(/\d+/);
    if (!match) return null;
    const peerMajor = parseInt(match[0], 10);

    // Only flag caret (^) or tilde (~) ranges locked to the source major.
    const isLocked = /^[\^~]/.test(peerRange.trim());
    if (isLocked && peerMajor === sourceMajor) {
      return { dependsOn: MUI_CORE_PACKAGE, requiredVersion: peerRange };
    }
    return null;
  });
}

// ─── shared scanner ───────────────────────────────────────────────────────────

function _scan(targetPath, directDepNames, checkFn) {
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

    const hit = checkFn(allDeps, pkgJson);
    if (hit) {
      results.push({
        name: depName,
        installedVersion: pkgJson.version,
        dependsOn: hit.dependsOn,
        requiredVersion: hit.requiredVersion,
        isDep: !!pkgJson.dependencies?.[hit.dependsOn],
        isPeer: !!pkgJson.peerDependencies?.[hit.dependsOn],
      });
    }
  }

  return results;
}

/**
 * @typedef {Object} AutoDetectedPackage
 * @property {string}  name              Package name.
 * @property {string}  installedVersion  Installed version string.
 * @property {string}  dependsOn         Which MUI package it requires.
 * @property {string}  requiredVersion   The version range it requires.
 * @property {boolean} isDep             True if listed under dependencies.
 * @property {boolean} isPeer            True if listed under peerDependencies.
 */
