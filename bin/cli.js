#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { runMigration } from '../src/index.js';

const program = new Command();

program
  .name('mui-upgrader')
  .description('MUI automatic migration tool (v4→v5 and v5→v6)')
  .version('1.0.0')
  .requiredOption('-t, --target <path>', 'Path to the React project to migrate')
  .option('--migration <version>', 'Migration path: "v4-to-v5" or "v5-to-v6"')
  .option('--dry-run', 'Preview changes without modifying files', false)
  .option('--verbose', 'Show detailed logging', false)
  .option('--no-backup', 'Skip creating backup files')
  .option('--skip <transformers>', 'Comma-separated list of transformers to skip', '')
  .action(async (options) => {
    // Resolve migration version — interactive prompt if not provided via flag
    let migrationVersion = options.migration;

    if (!migrationVersion) {
      const answer = await inquirer.prompt([
        {
          type: 'list',
          name: 'migrationVersion',
          message: 'Which migration would you like to run?',
          choices: [
            { name: 'MUI v4  →  v5  (material-ui to @mui)', value: 'v4-to-v5' },
            { name: 'MUI v5  →  v6  (upgrade to v6 API)',   value: 'v5-to-v6' },
          ],
        },
      ]);
      migrationVersion = answer.migrationVersion;
    }

    // Validate the flag value if provided directly
    if (!['v4-to-v5', 'v5-to-v6'].includes(migrationVersion)) {
      console.error(chalk.red(`\n❌ Invalid --migration value: "${migrationVersion}". Use "v4-to-v5" or "v5-to-v6".\n`));
      process.exit(1);
    }

    const label = migrationVersion === 'v5-to-v6' ? 'v5 → v6' : 'v4 → v5';
    console.log(chalk.bold.blue(`\n🔄 MUI ${label} Migration Tool\n`));

    if (options.dryRun) {
      console.log(chalk.yellow('⚠  Dry-run mode: no files will be modified.\n'));
    }

    try {
      const result = await runMigration({
        targetPath: options.target,
        dryRun: options.dryRun,
        verbose: options.verbose,
        backup: options.backup,
        skip: options.skip ? options.skip.split(',').map(s => s.trim()) : [],
        migrationVersion,
      });

      if (result.success) {
        console.log(chalk.green.bold('\n✅ Migration completed successfully!'));
        console.log(chalk.white(`   Files modified: ${result.filesModified}`));
        console.log(chalk.white(`   Transformations applied: ${result.transformationsApplied}`));
        if (result.warnings.length > 0) {
          console.log(chalk.yellow(`   Warnings: ${result.warnings.length} (review report for details)`));
        }
      } else {
        console.log(chalk.red.bold('\n❌ Migration completed with errors.'));
        result.errors.forEach(err => console.log(chalk.red(`   - ${err}`)));
      }

      // Version-specific next steps
      if (migrationVersion === 'v5-to-v6') {
        console.log(chalk.cyan('\n📋 Next steps for v5→v6:'));
        console.log(chalk.white('   1. Run `npm install` (or yarn/pnpm) to install v6 packages'));
        console.log(chalk.white('   2. Review warnings in the report — some changes need manual attention'));
        console.log(chalk.white('   3. Consider adopting theme.applyStyles() for dark mode theming'));
        console.log(chalk.white('   4. Opt-in to CSS variables: https://mui.com/material-ui/customization/css-theme-variables/'));
      } else {
        console.log(chalk.cyan('\n📋 Next steps for v4→v5:'));
        console.log(chalk.white('   1. Run `npm install` to install new packages'));
        console.log(chalk.white('   2. Review warnings in the report for manual migration items'));
      }

      if (result.reportPath) {
        console.log(chalk.cyan(`\n📄 Full report: ${result.reportPath}\n`));
      }
    } catch (error) {
      console.error(chalk.red(`\n❌ Migration failed: ${error.message}\n`));
      if (options.verbose) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

program.parse();
