import { writeFileSync } from 'fs';
import { migrateCorePackages } from './coreDeps.js';
import { addEmotionDependencies } from './emotionDeps.js';
import { migrateThirdPartyPackages } from './thirdPartyDeps.js';

/**
 * Orchestrates all package.json migrations.
 */
export function migratePackageJson(scanResult, options = {}) {
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
    // Detect original indentation
    const indent = detectIndent(scanResult.raw);
    const newContent = JSON.stringify(currentPkg, null, indent) + '\n';
    writeFileSync(scanResult.packageJsonPath, newContent, 'utf-8');
  }

  return {
    changes: allChanges,
    warnings: allWarnings,
    packageJson: currentPkg,
  };
}

function detectIndent(jsonString) {
  const match = jsonString.match(/^{\n(\s+)/);
  if (match) return match[1];
  return 2;
}
