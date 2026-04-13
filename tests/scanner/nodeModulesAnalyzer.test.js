import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { detectMuiV4Dependents, detectMuiPeerDepIncompatible } from '../../src/scanner/nodeModulesAnalyzer.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fakeRoot = join(__dirname, 'fixtures', 'fake-project');
const nodeModules = join(fakeRoot, 'node_modules');

function writePkg(pkgName, content) {
  const dir = join(nodeModules, pkgName);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'package.json'), JSON.stringify(content, null, 2));
}

beforeAll(() => {
  // bad-pkg: depends on @material-ui/core directly
  writePkg('bad-pkg', {
    name: 'bad-pkg',
    version: '1.2.3',
    dependencies: { '@material-ui/core': '^4.12.0', react: '^17.0.0' },
  });

  // peer-pkg: has @material-ui/core as a peer dependency
  writePkg('peer-pkg', {
    name: 'peer-pkg',
    version: '0.5.0',
    peerDependencies: { '@material-ui/core': '>=4.0.0' },
  });

  // ok-pkg: no MUI v4 deps at all
  writePkg('ok-pkg', {
    name: 'ok-pkg',
    version: '3.0.0',
    dependencies: { '@mui/material': '^5.0.0' },
  });

  // icons-pkg: depends on @material-ui/icons (different v4 package)
  writePkg('icons-pkg', {
    name: 'icons-pkg',
    version: '2.0.0',
    dependencies: { '@material-ui/icons': '^4.11.0' },
  });

  // v5-locked-pkg: peer dep caret-locked to @mui/material v5 (breaks on v6)
  writePkg('v5-locked-pkg', {
    name: 'v5-locked-pkg',
    version: '1.0.0',
    peerDependencies: { '@mui/material': '^5.0.0' },
  });

  // v6-locked-pkg: peer dep caret-locked to @mui/material v6 (breaks on v7)
  writePkg('v6-locked-pkg', {
    name: 'v6-locked-pkg',
    version: '2.0.0',
    peerDependencies: { '@mui/material': '^6.1.0' },
  });

  // v5-permissive-pkg: >= range — compatible with v6 and above
  writePkg('v5-permissive-pkg', {
    name: 'v5-permissive-pkg',
    version: '1.5.0',
    peerDependencies: { '@mui/material': '>=5.0.0' },
  });

  // no-mui-peer-pkg: no @mui/material peer dep at all
  writePkg('no-mui-peer-pkg', {
    name: 'no-mui-peer-pkg',
    version: '4.0.0',
    peerDependencies: { react: '>=17' },
  });
});

afterAll(() => {
  if (existsSync(fakeRoot)) rmSync(fakeRoot, { recursive: true, force: true });
});

describe('detectMuiV4Dependents', () => {
  it('detects a package with @material-ui/core in dependencies', () => {
    const results = detectMuiV4Dependents(fakeRoot, ['bad-pkg']);
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('bad-pkg');
    expect(results[0].dependsOn).toBe('@material-ui/core');
    expect(results[0].requiredVersion).toBe('^4.12.0');
    expect(results[0].isDep).toBe(true);
    expect(results[0].isPeer).toBe(false);
    expect(results[0].installedVersion).toBe('1.2.3');
  });

  it('detects a package with @material-ui/core in peerDependencies', () => {
    const results = detectMuiV4Dependents(fakeRoot, ['peer-pkg']);
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('peer-pkg');
    expect(results[0].isDep).toBe(false);
    expect(results[0].isPeer).toBe(true);
  });

  it('ignores packages with no MUI v4 dependency', () => {
    const results = detectMuiV4Dependents(fakeRoot, ['ok-pkg']);
    expect(results).toHaveLength(0);
  });

  it('detects @material-ui/icons as a MUI v4 package', () => {
    const results = detectMuiV4Dependents(fakeRoot, ['icons-pkg']);
    expect(results).toHaveLength(1);
    expect(results[0].dependsOn).toBe('@material-ui/icons');
  });

  it('handles a mix of bad and ok packages', () => {
    const results = detectMuiV4Dependents(fakeRoot, ['bad-pkg', 'ok-pkg', 'peer-pkg']);
    expect(results).toHaveLength(2);
    const names = results.map(r => r.name);
    expect(names).toContain('bad-pkg');
    expect(names).toContain('peer-pkg');
    expect(names).not.toContain('ok-pkg');
  });

  it('returns empty array when node_modules does not exist', () => {
    const results = detectMuiV4Dependents('/nonexistent/path', ['any-pkg']);
    expect(results).toEqual([]);
  });

  it('skips packages whose package.json is missing from node_modules', () => {
    // 'ghost-pkg' is in the dep list but not installed
    const results = detectMuiV4Dependents(fakeRoot, ['ghost-pkg']);
    expect(results).toEqual([]);
  });
});

describe('detectMuiPeerDepIncompatible', () => {
  it('flags a package caret-locked to the source major (v5→v6)', () => {
    const results = detectMuiPeerDepIncompatible(fakeRoot, ['v5-locked-pkg'], 5);
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('v5-locked-pkg');
    expect(results[0].dependsOn).toBe('@mui/material');
    expect(results[0].requiredVersion).toBe('^5.0.0');
    expect(results[0].isPeer).toBe(true);
  });

  it('flags a package caret-locked to the source major (v6→v7)', () => {
    const results = detectMuiPeerDepIncompatible(fakeRoot, ['v6-locked-pkg'], 6);
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('v6-locked-pkg');
    expect(results[0].requiredVersion).toBe('^6.1.0');
  });

  it('does NOT flag a package locked to a different major', () => {
    // v6-locked-pkg is ^6, but we are migrating from v5 — not relevant
    const results = detectMuiPeerDepIncompatible(fakeRoot, ['v6-locked-pkg'], 5);
    expect(results).toHaveLength(0);
  });

  it('does NOT flag a permissive >= range', () => {
    const results = detectMuiPeerDepIncompatible(fakeRoot, ['v5-permissive-pkg'], 5);
    expect(results).toHaveLength(0);
  });

  it('does NOT flag a package with no @mui/material peer dep', () => {
    const results = detectMuiPeerDepIncompatible(fakeRoot, ['no-mui-peer-pkg'], 5);
    expect(results).toHaveLength(0);
  });

  it('returns empty array when node_modules does not exist', () => {
    const results = detectMuiPeerDepIncompatible('/nonexistent/path', ['any-pkg'], 5);
    expect(results).toEqual([]);
  });

  it('handles a mix returning only the locked packages', () => {
    const results = detectMuiPeerDepIncompatible(
      fakeRoot,
      ['v5-locked-pkg', 'v5-permissive-pkg', 'no-mui-peer-pkg'],
      5
    );
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('v5-locked-pkg');
  });
});
