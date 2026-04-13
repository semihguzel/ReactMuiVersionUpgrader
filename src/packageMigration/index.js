import { writeFileSync } from 'fs';
import { migrateCorePackages } from './coreDeps.js';
import { addEmotionDependencies } from './emotionDeps.js';
import { migrateThirdPartyPackages } from './thirdPartyDeps.js';
import { migrateV6CorePackages } from './v6Deps.js';
import { migrateV7CorePackages } from './v7Deps.js';
import { migrateV8CorePackages } from './v8Deps.js';

/**
 * Orchestrates all package.json migrations.
 */
export function migratePackageJson(scanResult, options = {}) {
  if (options.migrationVersion === 'v7-to-v8') {
    return migratePackageJsonV8(scanResult, options);
  }
  if (options.migrationVersion === 'v6-to-v7') {
    return migratePackageJsonV7(scanResult, options);
  }
  if (options.migrationVersion === 'v5-to-v6') {
    return migratePackageJsonV6(scanResult, options);
  }
  return migratePackageJsonV45(scanResult, options);
}

/**
 * v4 → v5 package migration (original logic).
 */
function migratePackageJsonV45(scanResult, options = {}) {
  const allChanges = [];
  const allWarnings = [...scanResult.warnings];

  let currentPkg = scanResult.packageJson;

  // Step 1: Rename MUI core packages
  const coreResult = migrateCorePackages(currentPkg, scanResult);
  currentPkg = coreResult.packageJson;
  allChanges.push(...coreResult.changes);

  // Step 2: Add emotion dependencies
  const emotionResult = addEmotionDependencies(currentPkg, scanResult);
  currentPkg = emotionResult.packageJson;
  allChanges.push(...emotionResult.changes);

  // Step 3: Upgrade third-party packages
  const thirdPartyResult = migrateThirdPartyPackages(currentPkg, scanResult);
  currentPkg = thirdPartyResult.packageJson;
  allChanges.push(...thirdPartyResult.changes);
  allWarnings.push(...(thirdPartyResult.warnings || []));

  // Write the updated package.json
  if (!options.dryRun) {
    const indent = detectIndent(scanResult.raw);
    const newContent = JSON.stringify(currentPkg, null, indent) + '\n';
    writeFileSync(scanResult.packageJsonPath, newContent, 'utf-8');
  }

  return {
    changes: allChanges,
    warnings: allWarnings,
    packageJson: currentPkg,
    autoDetectedMuiDependents: scanResult.autoDetectedMuiDependents || [],
  };
}

/**
 * v7 → v8/v9 package migration: bumps core to v9, MUI X to v8, adds x-license if needed.
 */
function migratePackageJsonV8(scanResult, options = {}) {
  const allChanges = [];
  const allWarnings = [...(scanResult.warnings || [])];

  let currentPkg = scanResult.packageJson;

  const v8Result = migrateV8CorePackages(currentPkg, scanResult);
  currentPkg = v8Result.packageJson;
  allChanges.push(...v8Result.changes);
  allWarnings.push(...(v8Result.warnings || []));

  if (!options.dryRun) {
    const indent = detectIndent(scanResult.raw);
    const newContent = JSON.stringify(currentPkg, null, indent) + '\n';
    writeFileSync(scanResult.packageJsonPath, newContent, 'utf-8');
  }

  return {
    changes: allChanges,
    warnings: allWarnings,
    packageJson: currentPkg,
    autoDetectedMuiDependents: scanResult.autoDetectedMuiDependents || [],
  };
}

/**
 * v6 → v7 package migration: bumps versions, no renames.
 */
function migratePackageJsonV7(scanResult, options = {}) {
  const allChanges = [];
  const allWarnings = [...(scanResult.warnings || [])];

  let currentPkg = scanResult.packageJson;

  const v7Result = migrateV7CorePackages(currentPkg, scanResult);
  currentPkg = v7Result.packageJson;
  allChanges.push(...v7Result.changes);
  allWarnings.push(...(v7Result.warnings || []));

  if (!options.dryRun) {
    const indent = detectIndent(scanResult.raw);
    const newContent = JSON.stringify(currentPkg, null, indent) + '\n';
    writeFileSync(scanResult.packageJsonPath, newContent, 'utf-8');
  }

  return {
    changes: allChanges,
    warnings: allWarnings,
    packageJson: currentPkg,
    autoDetectedMuiDependents: scanResult.autoDetectedMuiDependents || [],
  };
}

/**
 * v5 → v6 package migration: bumps versions, no renames, skips emotion step.
 */
function migratePackageJsonV6(scanResult, options = {}) {
  const allChanges = [];
  const allWarnings = [...(scanResult.warnings || [])];

  let currentPkg = scanResult.packageJson;

  // Bump @mui/* package versions to v6/v7 targets
  const v6Result = migrateV6CorePackages(currentPkg, scanResult);
  currentPkg = v6Result.packageJson;
  allChanges.push(...v6Result.changes);
  allWarnings.push(...(v6Result.warnings || []));

  // Write the updated package.json
  if (!options.dryRun) {
    const indent = detectIndent(scanResult.raw);
    const newContent = JSON.stringify(currentPkg, null, indent) + '\n';
    writeFileSync(scanResult.packageJsonPath, newContent, 'utf-8');
  }

  return {
    changes: allChanges,
    warnings: allWarnings,
    packageJson: currentPkg,
    autoDetectedMuiDependents: scanResult.autoDetectedMuiDependents || [],
  };
}

function detectIndent(jsonString) {
  const match = jsonString.match(/^{\n(\s+)/);
  if (match) return match[1];
  return 2;
}
