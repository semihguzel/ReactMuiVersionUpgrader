import { resolve } from 'path';
import { existsSync } from 'fs';
import chalk from 'chalk';
import { analyzePackageJson } from './scanner/packageAnalyzer.js';
import { collectSourceFiles, filterMuiFiles } from './scanner/fileCollector.js';
import { migratePackageJson } from './packageMigration/index.js';
import { runTransformers } from './transformers/index.js';
import { generateReport } from './report/index.js';

/**
 * Main migration orchestrator.
 * Runs the complete MUI v4 → v5 migration pipeline.
 */
export async function runMigration(options) {
  const targetPath = resolve(options.targetPath);
  const verbose = options.verbose || false;
  const migrationVersion = options.migrationVersion ?? 'v4-to-v5';

  // Validate target path
  if (!existsSync(targetPath)) {
    throw new Error(`Target path does not exist: ${targetPath}`);
  }

  if (!existsSync(resolve(targetPath, 'package.json'))) {
    throw new Error(`No package.json found in: ${targetPath}`);
  }

  // Phase 1: Scan
  if (verbose) console.log(chalk.bold('\n📂 Phase 1: Scanning project...'));

  const scanResult = analyzePackageJson(targetPath, migrationVersion);

  const muiPackages = migrationVersion === 'v5-to-v6'
    ? (scanResult.muiV5Packages || [])
    : (scanResult.muiV4Packages || []);

  if (muiPackages.length === 0 && scanResult.alreadyMigratedPackages.length === 0) {
    return {
      success: true,
      filesModified: 0,
      transformationsApplied: 0,
      warnings: ['No MUI packages detected in this project.'],
      errors: [],
      reportPath: null,
    };
  }

  if (verbose) {
    const label = migrationVersion === 'v5-to-v6' ? 'MUI v5 packages found' : 'MUI v4 packages found';
    console.log(`  ${label}: ${muiPackages.length}`);
    for (const pkg of muiPackages) {
      const to = pkg.newName || pkg.targetVersion || '';
      console.log(`    - ${pkg.name}@${pkg.currentVersion}${to ? ` → ${to}` : ''}`);
    }
    if (scanResult.thirdPartyPackages.length > 0) {
      console.log(`  Third-party MUI packages: ${scanResult.thirdPartyPackages.length}`);
      for (const pkg of scanResult.thirdPartyPackages) {
        console.log(`    - ${pkg.name}@${pkg.currentVersion}`);
      }
    }
    if (scanResult.warnings.length > 0) {
      for (const w of scanResult.warnings) {
        console.log(chalk.yellow(`  ⚠ ${w}`));
      }
    }
  }

  // Phase 2: Package Migration
  if (verbose) console.log(chalk.bold('\n📦 Phase 2: Migrating packages...'));

  const packageResult = migratePackageJson(scanResult, {
    dryRun: options.dryRun,
    migrationVersion,
  });

  if (verbose) {
    console.log(`  Package changes: ${packageResult.changes.length}`);
    for (const change of packageResult.changes) {
      if (change.type === 'package-rename') {
        console.log(`    ${change.from} → ${change.to}`);
      }
    }
  }

  // Phase 3: Collect and transform source files
  if (verbose) console.log(chalk.bold('\n🔍 Phase 3: Collecting source files...'));

  const allFiles = await collectSourceFiles(targetPath);
  const muiFiles = await filterMuiFiles(allFiles);

  if (verbose) {
    console.log(`  Total source files: ${allFiles.length}`);
    console.log(`  Files with MUI imports: ${muiFiles.length}`);
  }

  // Phase 4: Run transformers
  if (verbose) console.log(chalk.bold('\n🔄 Phase 4: Running transformers...'));

  const transformResult = await runTransformers(muiFiles, {
    dryRun: options.dryRun,
    verbose: options.verbose,
    backup: options.backup,
    skip: options.skip,
    targetPath,
    migrationVersion,
  });

  // Phase 5: Generate report
  if (verbose) console.log(chalk.bold('\n📊 Phase 5: Generating report...'));

  const reportPath = generateReport(targetPath, packageResult, transformResult, {
    dryRun: options.dryRun,
    migrationVersion,
  });

  // Return summary
  const allWarnings = [
    ...(packageResult.warnings || []),
    ...transformResult.warnings.map(w => w.message || w),
  ];

  return {
    success: transformResult.errors.length === 0,
    filesModified: transformResult.filesModified,
    transformationsApplied: transformResult.transformations.length,
    warnings: allWarnings,
    errors: transformResult.errors,
    reportPath,
  };
}
