import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

/**
 * Generates a migration report in both console and file format.
 */
export function generateReport(targetPath, packageResult, transformResult, options = {}) {
  const migrationVersion = options.migrationVersion ?? 'v4-to-v5';
  const report = {
    timestamp: new Date().toISOString(),
    targetPath,
    migrationVersion,
    dryRun: !!options.dryRun,
    autoDetectedMuiDependents: packageResult.autoDetectedMuiDependents || [],
    summary: {
      filesProcessed: transformResult.filesProcessed,
      filesModified: transformResult.filesModified,
      totalTransformations: transformResult.transformations.length,
      totalWarnings: transformResult.warnings.length + (packageResult.warnings?.length || 0),
      totalErrors: transformResult.errors.length,
    },
    packageChanges: packageResult.changes || [],
    codeTransformations: transformResult.transformations,
    warnings: [
      ...(packageResult.warnings || []).map(w => ({ message: w, source: 'package' })),
      ...transformResult.warnings,
    ],
    errors: transformResult.errors,
  };

  // Console output
  printConsoleReport(report);

  // File output
  if (!options.dryRun) {
    const reportPath = writeReportFile(targetPath, report, migrationVersion);
    return reportPath;
  }

  return null;
}

function printConsoleReport(report) {
  console.log(chalk.bold('\n📊 Migration Report'));
  console.log(chalk.gray('─'.repeat(50)));

  // Summary
  console.log(chalk.bold('\nSummary:'));
  console.log(`  Files processed:     ${report.summary.filesProcessed}`);
  console.log(`  Files modified:      ${chalk.green(report.summary.filesModified)}`);
  console.log(`  Transformations:     ${chalk.blue(report.summary.totalTransformations)}`);

  if (report.summary.totalWarnings > 0) {
    console.log(`  Warnings:            ${chalk.yellow(report.summary.totalWarnings)}`);
  }
  if (report.summary.totalErrors > 0) {
    console.log(`  Errors:              ${chalk.red(report.summary.totalErrors)}`);
  }

  // Package changes
  if (report.packageChanges.length > 0) {
    console.log(chalk.bold('\nPackage Changes:'));
    for (const change of report.packageChanges) {
      switch (change.type) {
        case 'package-rename':
          console.log(`  ${chalk.red('- ' + change.from)} → ${chalk.green('+ ' + change.to)}`);
          break;
        case 'add-dependency':
          console.log(`  ${chalk.green('+ ' + change.package + '@' + change.version)} (${change.reason})`);
          break;
        case 'version-upgrade':
          console.log(`  ${chalk.yellow('↑ ' + change.package)}: ${change.from} → ${change.to}`);
          break;
        case 'package-replace':
          console.log(`  ${chalk.red('- ' + change.from)} → ${chalk.green('+ ' + change.to)}`);
          if (change.notes) console.log(`    ${chalk.gray(change.notes)}`);
          break;
        case 'related-upgrade':
          console.log(`  ${chalk.yellow('↑ ' + change.package)} → ${change.to} (${change.reason})`);
          break;
      }
    }
  }

  // Auto-detected incompatible packages
  if (report.autoDetectedMuiDependents?.length > 0) {
    console.log(chalk.bold.red('\nAuto-detected Incompatible Packages (internally require @material-ui/core):'));
    for (const pkg of report.autoDetectedMuiDependents) {
      const tag = pkg.isPeer ? 'peerDep' : 'dep';
      console.log(
        `  ${chalk.red('✗')} ${chalk.bold(pkg.name)}@${pkg.installedVersion} ` +
        `requires ${pkg.dependsOn}@${pkg.requiredVersion} (${tag})`
      );
    }
    console.log(chalk.gray('  → Known packages are auto-fixed above; unknown ones need manual upgrade.'));
  }

  // Transformation summary by type
  if (report.codeTransformations.length > 0) {
    console.log(chalk.bold('\nCode Transformations:'));
    const byType = {};
    for (const t of report.codeTransformations) {
      const key = t.type;
      byType[key] = (byType[key] || 0) + 1;
    }
    for (const [type, count] of Object.entries(byType).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${chalk.cyan(type)}: ${count}`);
    }
  }

  // Warnings
  if (report.warnings.length > 0) {
    console.log(chalk.bold.yellow('\nWarnings (manual review needed):'));
    const uniqueWarnings = [...new Set(report.warnings.map(w => w.message || w))];
    for (const warning of uniqueWarnings.slice(0, 20)) {
      console.log(`  ${chalk.yellow('⚠')} ${warning}`);
    }
    if (uniqueWarnings.length > 20) {
      console.log(chalk.gray(`  ... and ${uniqueWarnings.length - 20} more (see report file)`));
    }
  }

  // Errors
  if (report.errors.length > 0) {
    console.log(chalk.bold.red('\nErrors:'));
    for (const error of report.errors) {
      console.log(`  ${chalk.red('✗')} ${error}`);
    }
  }

  if (report.dryRun) {
    console.log(chalk.yellow.bold('\n⚠  DRY RUN - No files were modified.'));
  }

  // Post-migration steps (version-aware)
  console.log(chalk.bold('\nNext Steps:'));
  console.log('  1. Run: npm install (or yarn install)');
  console.log('  2. Run: npm start (or yarn start) to check for errors');
  console.log('  3. Review warnings above for manual migration items');
  console.log('  4. Test your application thoroughly');
  if (report.migrationVersion === 'v6-to-v7') {
    console.log('  5. Audit Grid/GridLegacy usage — verify container/item props work as expected');
    console.log('  6. Refactor Hidden/PigmentHidden with sx breakpoints or useMediaQuery');
    console.log('  7. Run lab codemod: npx @mui/codemod@latest v7.0.0/lab-removed-components <path>');
    console.log('  8. Ensure TypeScript >= 4.9: https://mui.com/material-ui/migration/upgrade-to-v7/');
  } else if (report.migrationVersion === 'v5-to-v6') {
    console.log('  5. Consider adopting theme.applyStyles() for dark mode theming');
    console.log('  6. Opt-in to CSS variables: https://mui.com/material-ui/customization/css-theme-variables/');
    console.log('  7. Review AccordionSummary DOM structure changes (now wrapped in <h3>)');
  } else {
    if (report.warnings.some(w => (w.message || w).includes('@mui/styles'))) {
      console.log('  5. Consider migrating makeStyles/withStyles to styled() or sx prop');
    }
  }
}

function writeReportFile(targetPath, report, migrationVersion = 'v4-to-v5') {
  const reportDir = join(targetPath, '.mui-migration-backup');
  mkdirSync(reportDir, { recursive: true });

  const suffix =
    migrationVersion === 'v7-to-v8' ? 'v7-v8' :
    migrationVersion === 'v6-to-v7' ? 'v6-v7' :
    migrationVersion === 'v5-to-v6' ? 'v5-v6' : 'v4-v5';
  const reportPath = join(reportDir, `migration-report-${suffix}.json`);
  writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');

  const label =
    migrationVersion === 'v7-to-v8' ? 'v7 → v8/v9' :
    migrationVersion === 'v6-to-v7' ? 'v6 → v7' :
    migrationVersion === 'v5-to-v6' ? 'v5 → v6' : 'v4 → v5';

  // Also write a human-readable version
  const textPath = join(reportDir, `migration-report-${suffix}.txt`);
  const lines = [
    `=== MUI ${label} Migration Report ===`,
    `Date: ${report.timestamp}`,
    `Target: ${report.targetPath}`,
    '',
    '--- Summary ---',
    `Files processed: ${report.summary.filesProcessed}`,
    `Files modified: ${report.summary.filesModified}`,
    `Transformations: ${report.summary.totalTransformations}`,
    `Warnings: ${report.summary.totalWarnings}`,
    `Errors: ${report.summary.totalErrors}`,
    '',
    '--- Package Changes ---',
    ...report.packageChanges.map(c => `  ${c.type}: ${JSON.stringify(c)}`),
    '',
    '--- Code Transformations ---',
    ...report.codeTransformations.map(t =>
      `  [${t.transformer}] ${t.file}: ${t.type} - ${t.from || ''} → ${t.to || ''}`
    ),
    '',
    '--- Warnings ---',
    ...report.warnings.map(w => `  �� ${w.message || w}${w.file ? ` (${w.file})` : ''}`),
    '',
    '--- Errors ---',
    ...report.errors.map(e => `  ✗ ${e}`),
  ];

  writeFileSync(textPath, lines.join('\n'), 'utf-8');

  return reportPath;
}
