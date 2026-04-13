import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { cpSync, rmSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { runMigration } from '../src/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixtureInput = join(__dirname, 'fixtures', 'input');
const tempProject = join(__dirname, 'fixtures', 'temp-test-project');

describe('Full migration integration test', () => {
  beforeAll(() => {
    // Copy input fixtures to temp directory
    cpSync(fixtureInput, tempProject, { recursive: true });
  });

  afterAll(() => {
    // Clean up temp directory
    if (existsSync(tempProject)) {
      rmSync(tempProject, { recursive: true, force: true });
    }
  });

  it('should run full migration successfully', async () => {
    const result = await runMigration({
      targetPath: tempProject,
      dryRun: false,
      verbose: false,
      backup: true,
      skip: [],
    });

    expect(result.success).toBe(true);
    expect(result.filesModified).toBeGreaterThan(0);
    expect(result.transformationsApplied).toBeGreaterThan(0);
  });

  it('should update package.json correctly', async () => {
    const pkg = JSON.parse(readFileSync(join(tempProject, 'package.json'), 'utf-8'));

    // Old packages should be removed
    expect(pkg.dependencies['@material-ui/core']).toBeUndefined();
    expect(pkg.dependencies['@material-ui/icons']).toBeUndefined();
    expect(pkg.dependencies['@material-ui/lab']).toBeUndefined();
    expect(pkg.dependencies['@material-ui/styles']).toBeUndefined();

    // New packages should exist
    expect(pkg.dependencies['@mui/material']).toBeDefined();
    expect(pkg.dependencies['@mui/icons-material']).toBeDefined();
    expect(pkg.dependencies['@mui/lab']).toBeDefined();
    expect(pkg.dependencies['@mui/styles']).toBeDefined();

    // Emotion should be added
    expect(pkg.dependencies['@emotion/react']).toBeDefined();
    expect(pkg.dependencies['@emotion/styled']).toBeDefined();

    // DevExpress should be upgraded
    expect(pkg.dependencies['@devexpress/dx-react-scheduler-material-ui']).toMatch(/\^4/);
    expect(pkg.dependencies['@devexpress/dx-react-core']).toMatch(/\^4/);

    // @mui/x-date-pickers should be pinned to ^5 to satisfy devexpress peer dep
    expect(pkg.dependencies['@mui/x-date-pickers']).toBe('^5.0.15');

    // notistack should be upgraded
    expect(pkg.dependencies['notistack']).toMatch(/\^3/);

    // formik-material-ui should be replaced by formik-mui@^4.0.0
    expect(pkg.dependencies['formik-material-ui']).toBeUndefined();
    expect(pkg.dependencies['formik-mui']).toBe('^4.0.0');

    // formik-material-ui-pickers should remain (no automatic replacement, only a warning)
    expect(pkg.dependencies['formik-material-ui-pickers']).toBeDefined();
  });

  it('should transform imports in App.jsx', () => {
    const content = readFileSync(join(tempProject, 'src', 'App.jsx'), 'utf-8');

    // Old imports should be replaced
    expect(content).not.toContain('@material-ui/core');
    expect(content).not.toContain('@material-ui/lab');
    expect(content).not.toContain('@material-ui/icons');

    // New imports should exist
    expect(content).toContain('@mui/material');
    expect(content).toContain('@mui/icons-material');

    // createMuiTheme should be renamed
    expect(content).not.toContain('createMuiTheme');
    expect(content).toContain('createTheme');

    // fade should be renamed to alpha
    expect(content).toContain('alpha');

    // palette.type should become palette.mode
    expect(content).toContain('mode:');

    // JSS classes should be updated
    expect(content).toContain('Mui-focused');

    // Alert/Skeleton should move from lab to material
    expect(content).toContain("from '@mui/material'");
  });

  it('should transform Scheduler.jsx imports', () => {
    const content = readFileSync(join(tempProject, 'src', 'Scheduler.jsx'), 'utf-8');

    expect(content).not.toContain('@material-ui/core');
    expect(content).toContain('@mui/material');
  });

  it('should transform DialogExample.jsx', () => {
    const content = readFileSync(join(tempProject, 'src', 'DialogExample.jsx'), 'utf-8');

    // ExpansionPanel should be renamed
    expect(content).not.toContain('ExpansionPanel');
    expect(content).toContain('Accordion');
    expect(content).toContain('AccordionSummary');
    expect(content).toContain('AccordionDetails');

    // variant values
    expect(content).toContain('variant="circular"');
    expect(content).toContain('variant="filled"');
    expect(content).toContain('variant="determinate"');
    expect(content).toContain('collapsedSize');

    // TablePagination props
    expect(content).toContain('onPageChange');
    expect(content).toContain('onRowsPerPageChange');
  });

  it('should transform Grid justify prop in App.jsx', () => {
    const content = readFileSync(join(tempProject, 'src', 'App.jsx'), 'utf-8');
    expect(content).toContain('justifyContent');
  });

  it('should create backup files', () => {
    const backupDir = join(tempProject, '.mui-migration-backup');
    expect(existsSync(backupDir)).toBe(true);
    expect(existsSync(join(backupDir, 'src', 'App.jsx'))).toBe(true);
  });

  it('should create migration report', () => {
    const reportPath = join(tempProject, '.mui-migration-backup', 'migration-report-v4-v5.json');
    expect(existsSync(reportPath)).toBe(true);

    const report = JSON.parse(readFileSync(reportPath, 'utf-8'));
    expect(report.summary.filesModified).toBeGreaterThan(0);
    expect(report.packageChanges.length).toBeGreaterThan(0);
  });
});
