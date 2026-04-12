import fg from 'fast-glob';
import { join } from 'path';

/**
 * Collects all source files (.js, .jsx, .ts, .tsx) from the target project,
 * excluding node_modules, build outputs, and other non-source directories.
 */
export async function collectSourceFiles(targetPath) {
  const patterns = [
    '**/*.{js,jsx,ts,tsx}',
  ];

  const ignorePatterns = [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/.next/**',
    '**/coverage/**',
    '**/__snapshots__/**',
    '**/vendor/**',
    '**/*.min.js',
    '**/*.bundle.js',
    '**/*.d.ts',
    '**/.mui-migration-backup/**',
  ];

  const files = await fg(patterns, {
    cwd: targetPath,
    ignore: ignorePatterns,
    absolute: true,
    onlyFiles: true,
    dot: false,
  });

  return files.sort();
}

/**
 * Filters collected files to only those that contain MUI-related imports.
 * This is a quick pre-filter using string search (no AST parsing).
 */
export async function filterMuiFiles(files) {
  const { readFileSync } = await import('fs');
  const muiPatterns = [
    '@material-ui/',
    '@mui/',
    'createMuiTheme',
    'makeStyles',
    'withStyles',
    'createStyles',
  ];

  const muiFiles = [];

  for (const filePath of files) {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const hasMui = muiPatterns.some(pattern => content.includes(pattern));
      if (hasMui) {
        muiFiles.push(filePath);
      }
    } catch {
      // Skip files that can't be read
    }
  }

  return muiFiles;
}
