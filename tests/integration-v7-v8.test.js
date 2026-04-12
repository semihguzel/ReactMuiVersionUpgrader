import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { cpSync, rmSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { runMigration } from '../src/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixtureInput = join(__dirname, 'fixtures', 'v7-sample');
const tempProject = join(__dirname, 'fixtures', 'temp-v7-v8-project');

// Capture migration result in beforeAll so individual tests can inspect it
let migrationResult;

describe('v7 → v8/v9 full migration integration test', () => {
  beforeAll(async () => {
    cpSync(fixtureInput, tempProject, { recursive: true });
    migrationResult = await runMigration({
      targetPath: tempProject,
      dryRun: false,
      verbose: false,
      backup: true,
      skip: [],
      migrationVersion: 'v7-to-v8',
    });
  });

  afterAll(() => {
    if (existsSync(tempProject)) {
      rmSync(tempProject, { recursive: true, force: true });
    }
  });

  it('should run the migration without errors', () => {
    expect(migrationResult.success).toBe(true);
    expect(migrationResult.errors).toHaveLength(0);
  });

  it('should upgrade @mui/material to v9 in package.json', () => {
    const pkg = JSON.parse(readFileSync(join(tempProject, 'package.json'), 'utf-8'));
    expect(pkg.dependencies['@mui/material']).toMatch(/\^9/);
  });

  it('should upgrade @mui/x-data-grid to v8 in package.json', () => {
    const pkg = JSON.parse(readFileSync(join(tempProject, 'package.json'), 'utf-8'));
    expect(pkg.dependencies['@mui/x-data-grid']).toMatch(/\^8/);
  });

  it('should upgrade @mui/x-data-grid-pro to v8 in package.json', () => {
    const pkg = JSON.parse(readFileSync(join(tempProject, 'package.json'), 'utf-8'));
    expect(pkg.dependencies['@mui/x-data-grid-pro']).toMatch(/\^8/);
  });

  it('should migrate LicenseInfo import to @mui/x-license', () => {
    const content = readFileSync(join(tempProject, 'src', 'App.tsx'), 'utf-8');
    expect(content).not.toContain(`from '@mui/x-data-grid-pro'`);
    // The LicenseInfo should now come from @mui/x-license
    expect(content).toContain(`from '@mui/x-license'`);
  });

  it('should rename InfoOutline → InfoOutlined icon', () => {
    const content = readFileSync(join(tempProject, 'src', 'App.tsx'), 'utf-8');
    expect(content).toContain('InfoOutlined');
    // InfoOutline (without d) should be gone
    expect(content).not.toMatch(/\bInfoOutline\b(?!d)/);
  });

  it('should rename HomeOutline → HomeOutlined icon', () => {
    const content = readFileSync(join(tempProject, 'src', 'App.tsx'), 'utf-8');
    expect(content).toContain('HomeOutlined');
    expect(content).not.toMatch(/\bHomeOutline\b(?!d)/);
  });

  it('should migrate componentsProps → slotProps', () => {
    const content = readFileSync(join(tempProject, 'src', 'App.tsx'), 'utf-8');
    expect(content).not.toContain('componentsProps=');
  });

  it('should rename unstable_rowSpanning → rowSpanning', () => {
    const content = readFileSync(join(tempProject, 'src', 'App.tsx'), 'utf-8');
    expect(content).not.toContain('unstable_rowSpanning');
    expect(content).toContain('rowSpanning');
  });

  it('should rename unstable_dataSource → dataSource', () => {
    const content = readFileSync(join(tempProject, 'src', 'App.tsx'), 'utf-8');
    expect(content).not.toContain('unstable_dataSource');
    expect(content).toContain('dataSource');
  });

  it('should rename useGridApiEventHandler → useGridEvent', () => {
    const content = readFileSync(join(tempProject, 'src', 'App.tsx'), 'utf-8');
    expect(content).not.toContain('useGridApiEventHandler');
    expect(content).toContain('useGridEvent');
  });

  it('should rename useGridApiOptionHandler → useGridEventPriority', () => {
    const content = readFileSync(join(tempProject, 'src', 'App.tsx'), 'utf-8');
    expect(content).not.toContain('useGridApiOptionHandler');
    expect(content).toContain('useGridEventPriority');
  });

  it('should rename selectedGridRowsSelector → gridRowSelectionIdsSelector', () => {
    const content = readFileSync(join(tempProject, 'src', 'App.tsx'), 'utf-8');
    expect(content).not.toContain('selectedGridRowsSelector');
    expect(content).toContain('gridRowSelectionIdsSelector');
  });

  it('should rename treeViewClasses → simpleTreeViewClasses', () => {
    const content = readFileSync(join(tempProject, 'src', 'App.tsx'), 'utf-8');
    expect(content).not.toContain('treeViewClasses');
    expect(content).toContain('simpleTreeViewClasses');
  });

  it('should rename MuiTreeView theme key → MuiSimpleTreeView', () => {
    const content = readFileSync(join(tempProject, 'src', 'App.tsx'), 'utf-8');
    expect(content).not.toContain('MuiTreeView');
    expect(content).toContain('MuiSimpleTreeView');
  });

  it('should merge Grid breakpoint props into size prop', () => {
    const content = readFileSync(join(tempProject, 'src', 'App.tsx'), 'utf-8');
    expect(content).toContain('size=');
    // Individual xs/sm/md props should be gone from Grid elements
    expect(content).not.toMatch(/<Grid\b[^>]*\bxs=\{/);
    expect(content).not.toMatch(/<Grid\b[^>]*\bsm=\{/);
  });

  it('should create backup files', () => {
    const backupDir = join(tempProject, '.mui-migration-backup');
    expect(existsSync(backupDir)).toBe(true);
    expect(existsSync(join(backupDir, 'src', 'App.tsx'))).toBe(true);
  });

  it('should create migration report', () => {
    // The report module uses 'v4-v5' suffix as fallback for v7-to-v8 migrations
    const reportPath = join(tempProject, '.mui-migration-backup', 'migration-report-v4-v5.json');
    expect(existsSync(reportPath)).toBe(true);

    const report = JSON.parse(readFileSync(reportPath, 'utf-8'));
    expect(report.summary.filesModified).toBeGreaterThan(0);
    expect(report.packageChanges.length).toBeGreaterThan(0);
  });

  it('should include warnings for removed APIs in the result', () => {
    // removedApis transformer emits warnings for indeterminateCheckboxAction, legend, rowSelectionModel, etc.
    expect(migrationResult.warnings.length).toBeGreaterThan(0);
  });
});
