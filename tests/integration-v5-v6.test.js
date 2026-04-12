import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { cpSync, rmSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { runMigration } from '../src/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixtureInput = join(__dirname, 'fixtures', 'v5-sample');
const tempProject = join(__dirname, 'fixtures', 'temp-v5-v6-project');

describe('v5 → v6 full migration integration test', () => {
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
      migrationVersion: 'v5-to-v6',
    });

    expect(result.success).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should upgrade @mui/material to v6 in package.json', () => {
    const pkg = JSON.parse(readFileSync(join(tempProject, 'package.json'), 'utf-8'));
    expect(pkg.dependencies['@mui/material']).toMatch(/\^6/);
  });

  it('should upgrade @mui/icons-material to v6 in package.json', () => {
    const pkg = JSON.parse(readFileSync(join(tempProject, 'package.json'), 'utf-8'));
    expect(pkg.dependencies['@mui/icons-material']).toMatch(/\^6/);
  });

  it('should upgrade @mui/lab to v6 in package.json', () => {
    const pkg = JSON.parse(readFileSync(join(tempProject, 'package.json'), 'utf-8'));
    expect(pkg.dependencies['@mui/lab']).toMatch(/\^6/);
  });

  it('should rename Unstable_Grid2 → Grid2 in source files', () => {
    const content = readFileSync(join(tempProject, 'src', 'App.tsx'), 'utf-8');
    expect(content).not.toContain('Unstable_Grid2');
    expect(content).toContain('Grid2');
  });

  it('should remove disableEqualOverflow prop', () => {
    const content = readFileSync(join(tempProject, 'src', 'App.tsx'), 'utf-8');
    expect(content).not.toContain('disableEqualOverflow');
  });

  it('should migrate components= → slots= on Modal', () => {
    const content = readFileSync(join(tempProject, 'src', 'App.tsx'), 'utf-8');
    expect(content).not.toContain('components={');
    expect(content).toContain('slots=');
  });

  it('should migrate componentsProps= → slotProps= on Modal', () => {
    const content = readFileSync(join(tempProject, 'src', 'App.tsx'), 'utf-8');
    expect(content).not.toContain('componentsProps=');
    expect(content).toContain('slotProps=');
  });

  it('should migrate Accordion TransitionComponent → slots.transition', () => {
    const content = readFileSync(join(tempProject, 'src', 'App.tsx'), 'utf-8');
    expect(content).not.toContain('TransitionComponent=');
    expect(content).toContain('slots=');
  });

  it('should migrate ListItem button → ListItemButton', () => {
    const content = readFileSync(join(tempProject, 'src', 'App.tsx'), 'utf-8');
    expect(content).toContain('ListItemButton');
    expect(content).not.toContain('<ListItem button>');
  });

  it('should migrate ListItemText primaryTypographyProps → slotProps', () => {
    const content = readFileSync(join(tempProject, 'src', 'App.tsx'), 'utf-8');
    expect(content).not.toContain('primaryTypographyProps=');
    expect(content).not.toContain('secondaryTypographyProps=');
  });

  it('should migrate Box system props → sx', () => {
    const content = readFileSync(join(tempProject, 'src', 'App.tsx'), 'utf-8');
    expect(content).not.toContain('<Box mt={');
    expect(content).toContain('sx=');
  });

  it('should create backup files', () => {
    const backupDir = join(tempProject, '.mui-migration-backup');
    expect(existsSync(backupDir)).toBe(true);
    expect(existsSync(join(backupDir, 'src', 'App.tsx'))).toBe(true);
  });

  it('should create migration report', () => {
    const reportPath = join(tempProject, '.mui-migration-backup', 'migration-report-v5-v6.json');
    expect(existsSync(reportPath)).toBe(true);

    const report = JSON.parse(readFileSync(reportPath, 'utf-8'));
    expect(report.summary.filesModified).toBeGreaterThan(0);
  });
});
