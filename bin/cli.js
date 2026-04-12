#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { runMigration } from '../src/index.js';

const program = new Command();

program
  .name('mui-upgrader')
  .description('MUI v4 to v5 automatic migration tool')
  .version('1.0.0')
  .requiredOption('-t, --target <path>', 'Path to the React project to migrate')
  .option('--dry-run', 'Preview changes without modifying files', false)
  .option('--verbose', 'Show detailed logging', false)
  .option('--no-backup', 'Skip creating backup files')
  .option('--skip <transformers>', 'Comma-separated list of transformers to skip', '')
  .action(async (options) => {
    console.log(chalk.bold.blue('\n🔄 MUI v4 → v5 Migration Tool\n'));

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
