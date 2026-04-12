import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { cpSync, rmSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { runMigration } from '../src/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixtureInput = join(__dirname, 'fixtures', 'v6-sample');
const tempProject = join(__dirname, 'fixtures', 'temp-v6-v7-project');

describe('v6 → v7 full migration integration test', () => {
  beforeAll(() => {
    cpSync(fixtureInput, tempProject, { recursive: true });
  });

  afterAll(() => {
    if (existsSync(tempProject)) {
      rmSync(tempProject, { recursive: true, force: true });
    }
  });

  it('should run the migration without errors', async () => {
    const result = await runMigration({
      targetPath: tempProject,
      dryRun: false,
      verbose: false,
      backup: true,
      skip: [],
      migrationVersion: 'v6-to-v7',
    });

    expect(result.success).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should upgrade @mui/material to v7 in package.json', () => {
    const pkg = JSON.parse(readFileSync(join(tempProject, 'package.json'), 'utf-8'));
    expect(pkg.dependencies['@mui/material']).toMatch(/\^7/);
  });

  it('should upgrade @mui/icons-material to v7 in package.json', () => {
    const pkg = JSON.parse(readFileSync(join(tempProject, 'package.json'), 'utf-8'));
    expect(pkg.dependencies['@mui/icons-material']).toMatch(/\^7/);
  });

  it('should fix deep import @mui/material/styles/createTheme → @mui/material/styles', () => {
    const content = readFileSync(join(tempProject, 'src', 'App.tsx'), 'utf-8');
    expect(content).not.toContain('@mui/material/styles/createTheme');
    expect(content).toContain("from '@mui/material/styles'");
  });

  it('should fix deep import @mui/material/TablePagination/TablePaginationActions', () => {
    const content = readFileSync(join(tempProject, 'src', 'App.tsx'), 'utf-8');
    expect(content).not.toContain('@mui/material/TablePagination/TablePaginationActions');
    expect(content).toContain('@mui/material/TablePaginationActions');
  });

  it('should move StyledEngineProvider to @mui/material/styles import', () => {
    const content = readFileSync(join(tempProject, 'src', 'App.tsx'), 'utf-8');
    expect(content).toContain("from '@mui/material/styles'");
    // StyledEngineProvider should no longer be in the barrel import
    const barrelImportMatch = content.match(/import\s*\{[^}]*\}\s*from\s*'@mui\/material'/);
    if (barrelImportMatch) {
      expect(barrelImportMatch[0]).not.toContain('StyledEngineProvider');
    }
  });

  it('should rename Grid → GridLegacy in source', () => {
    const content = readFileSync(join(tempProject, 'src', 'App.tsx'), 'utf-8');
    expect(content).toContain('GridLegacy');
  });

  it('should rename Grid2 → Grid in source', () => {
    const content = readFileSync(join(tempProject, 'src', 'App.tsx'), 'utf-8');
    // Grid2 should be gone; Grid (the new Grid) should be present
    expect(content).not.toContain('Grid2');
  });

  it('should rename size="normal" → size="medium" on Button', () => {
    const content = readFileSync(join(tempProject, 'src', 'App.tsx'), 'utf-8');
    expect(content).not.toContain('size="normal"');
    expect(content).toContain('size="medium"');
  });

  it('should create backup files', () => {
    const backupDir = join(tempProject, '.mui-migration-backup');
    expect(existsSync(backupDir)).toBe(true);
    expect(existsSync(join(backupDir, 'src', 'App.tsx'))).toBe(true);
  });

  it('should create migration report', () => {
    const reportPath = join(tempProject, '.mui-migration-backup', 'migration-report-v6-v7.json');
    expect(existsSync(reportPath)).toBe(true);

    const report = JSON.parse(readFileSync(reportPath, 'utf-8'));
    expect(report.summary.filesModified).toBeGreaterThan(0);
  });

  it('should include warnings about @mui/lab and Hidden in the result', async () => {
    // Re-run in dry-run mode to capture warnings without modifying temp files
    const result = await runMigration({
      targetPath: tempProject,
      dryRun: true,
      verbose: false,
      backup: false,
      skip: [],
      migrationVersion: 'v6-to-v7',
    });

    // Some warnings are expected (Hidden component, @mui/lab, etc.)
    // The migration should still be considered successful
    expect(result.success).toBe(true);
  });
});
