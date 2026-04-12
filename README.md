# react-mui-version-upgrader

A CLI tool that automatically migrates React projects between MUI (Material UI) versions. It handles package renames, import path updates, component renames, prop changes, theme API updates, and style migrations — and generates a full report of every change made.

## Supported Migration Paths

| Migration | Description |
|-----------|-------------|
| `v4-to-v5` | `@material-ui/*` → `@mui/*`, Emotion setup, component/prop renames |
| `v5-to-v6` | Grid2 rename, slot prop migration, system prop deprecations |
| `v6-to-v7` | Deep import fixes, Grid → GridLegacy rename, lab removals |
| `v7-to-v8` | MUI X v8 + Material UI v9, license API, icon/hook/selector renames |

## Requirements

- Node.js >= 18
- Your project must have a `package.json` at its root

## Installation

**Run directly without installing (recommended):**

```bash
npx react-mui-version-upgrader -t ./my-project
```

**Or install globally:**

```bash
npm install -g react-mui-version-upgrader
mui-upgrader -t ./my-project
```

**Or clone and run locally:**

```bash
git clone https://github.com/semihguzel/ReactMuiVersionUpgrader.git
cd ReactMuiVersionUpgrader
npm install
npm start -- -t ./my-project
```

## Usage

```
mui-upgrader -t <path> [options]
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `-t, --target <path>` | **Required.** Path to the React project to migrate | — |
| `--migration <version>` | Migration path: `v4-to-v5`, `v5-to-v6`, `v6-to-v7`, or `v7-to-v8` | Interactive prompt |
| `--dry-run` | Preview changes without modifying any files | `false` |
| `--verbose` | Show detailed per-file logging during migration | `false` |
| `--no-backup` | Skip creating backup files before modifying | backups on |
| `--skip <transformers>` | Comma-separated list of transformer names to skip | `''` |
| `--version` | Print the tool version | — |
| `--help` | Print usage info | — |

### Interactive Mode

If `--migration` is not provided, the tool prompts you to choose:

```
? Which migration would you like to run?
  MUI v4  →  v5  (material-ui to @mui)
  MUI v5  →  v6  (upgrade to v6 API)
  MUI v6  →  v7  (upgrade to v7 API)
❯ MUI v7  →  v8/v9  (MUI X v8 + Material UI v9)
```

## Examples

**Preview a v4→v5 migration without touching files:**
```bash
mui-upgrader -t ./my-app --migration v4-to-v5 --dry-run
```

**Run a v6→v7 migration with verbose output:**
```bash
mui-upgrader -t ./my-app --migration v6-to-v7 --verbose
```

**Run v7→v8 migration, skip a specific transformer:**
```bash
mui-upgrader -t ./my-app --migration v7-to-v8 --skip iconRenames
```

**Run without creating backup files:**
```bash
mui-upgrader -t ./my-app --migration v5-to-v6 --no-backup
```

## What the Tool Does

The migration runs in five phases:

1. **Scan** — reads `package.json` to detect installed MUI packages and their versions
2. **Package migration** — updates `package.json` with new package names and target versions
3. **File collection** — finds all `.js`, `.jsx`, `.ts`, `.tsx` files that import from MUI
4. **Transform** — applies ordered transformers to each file (see below)
5. **Report** — prints a summary to the console and writes a JSON + text report to `.mui-migration-backup/`

### Backups

Unless `--no-backup` is passed, every modified file is copied to `.mui-migration-backup/<relative-path>` before being changed. The migration report is also written there.

## What Each Migration Transforms

### v4 → v5

- Renames `@material-ui/*` packages to `@mui/*` in `package.json`
- Adds `@emotion/react` and `@emotion/styled` as required dependencies
- Rewrites `@material-ui/core` and deep import paths in source files
- Moves `@mui/lab` components that graduated to `@mui/material`
- Renames color utility imports (`fade` → `alpha`)
- Renames components: `ExpansionPanel*` → `Accordion*`, `GridList*` → `ImageList*`
- Removes deprecated `innerRef`/`rootRef` props
- Renames theme API: `createMuiTheme` → `createTheme`, `type: 'dark'` → `mode: 'dark'`
- Migrates JSS-style class names to `tss-react` / `@mui/styles`
- Updates `makeStyles` import paths

### v5 → v6

- Renames `Grid2` imports to `Grid` (the new default grid in v6)
- Migrates legacy `componentsProps` to `slotProps`, and `components` to `slots`
- Migrates Accordion-specific slot props
- Migrates `ListItemText` slot props
- Replaces `ListItem button` prop usage with `ListItemButton`
- Warns about deprecated system props (`mt`, `px`, etc.) that should move to `sx`
- Warns about variant prop defaults that changed in v6
- Warns where `theme.palette.mode` checks should use `theme.applyStyles()`

### v6 → v7

- Fixes deep import paths (e.g. `@mui/material/Button` → `@mui/material`)
- Removes or replaces `StyledEngineProvider` imports
- Renames `Grid` → `GridLegacy` and `Grid2` → `Grid`
- Fixes `InputLabel` `size` prop value (`'normal'` → `'medium'`)
- Warns about `@mui/lab` components removed in v7 (Masonry, TabList, etc.)
- Warns about removed APIs (Hidden, PigmentHidden, etc.)

### v7 → v8/v9

- Updates `@mui/x-license-pro` / `@mui/x-license` imports to `@mui/x-license`
- Renames DataGrid `componentsProps` to `slotProps`
- Renames changed MUI X icons
- Renames `unstable_*` DataGrid features that are now stable
- Renames changed DataGrid hooks (e.g. `useGridApiContext`)
- Renames changed selectors and Tree View types
- Migrates DataGrid `xs`/`sm`/`md`/`lg`/`xl` size props to the new `size` API
- Warns about manually required changes (toolbar `showToolbar`, `rowSelectionModel` type change, etc.)

## Available Transformer Names (for `--skip`)

| Name | Migration | Phase |
|------|-----------|-------|
| `packageRename` | v4→v5 | imports |
| `labToCore` | v4→v5 | imports |
| `colorImports` | v4→v5 | imports |
| `expansionToAccordion` | v4→v5 | components |
| `gridListToImageList` | v4→v5 | components |
| `rootRefRemoval` | v4→v5 | components |
| `genericPropRename` | v4→v5 | props |
| `variantDefaults` | v4→v5 | props |
| `linkUnderline` | v4→v5 | props |
| `createTheme` | v4→v5 | theme |
| `paletteMode` | v4→v5 | theme |
| `fadeToAlpha` | v4→v5 | theme |
| `themeStructure` | v4→v5 | theme |
| `jssClasses` | v4→v5 | styles |
| `makeStylesImport` | v4→v5 | styles |
| `grid2Rename` | v5→v6 | imports |
| `slotsProps` | v5→v6 | props |
| `accordionSlots` | v5→v6 | props |
| `listItemTextSlots` | v5→v6 | props |
| `listItemButton` | v5→v6 | components |
| `systemProps` | v5→v6 | props |
| `variantDefaultsV6` | v5→v6 | props |
| `applyStyles` | v5→v6 | theme |
| `deepImportPaths` | v6→v7 | imports |
| `styledEngineProvider` | v6→v7 | imports |
| `gridRename` | v6→v7 | imports |
| `inputLabelSize` | v6→v7 | props |
| `labRemovedComponents` | v6→v7 | imports |
| `removedApis` | v6→v7, v7→v8 | warnings |
| `licenseInfo` | v7→v8 | imports |
| `componentsPropsToSlotProps` | v7→v8 | imports |
| `iconRenames` | v7→v8 | imports |
| `unstableFeatures` | v7→v8 | imports |
| `hookRenames` | v7→v8 | imports |
| `selectorRenames` | v7→v8 | imports |
| `gridSizeProps` | v7→v8 | props |

## Output

After the migration completes you will see a console report like:

```
📊 Migration Report
──────────────────────────────────────────────────

Summary:
  Files processed:     42
  Files modified:      18
  Transformations:     87
  Warnings:            3

Package Changes:
  - @material-ui/core → + @mui/material
  + @emotion/react@^11.11.0 (required peer dependency)

Code Transformations:
  import-rename: 54
  component-rename: 20
  prop-rename: 13

⚠ Warnings (manual review needed):
  ⚠ makeStyles detected — consider migrating to styled() or sx prop
```

A JSON report and a human-readable `.txt` report are written to:
```
<your-project>/.mui-migration-backup/migration-report-<version>.json
<your-project>/.mui-migration-backup/migration-report-<version>.txt
```

## After Running the Migration

Regardless of which migration you ran:

1. **Install updated packages:** `npm install` (or `yarn` / `pnpm install`)
2. **Start the app** and check for runtime or TypeScript errors: `npm start`
3. **Review warnings** in the report — some changes require manual attention
4. **Test thoroughly** — automated transforms cover the common cases but cannot handle all patterns

### v7 → v8/v9 — additional steps

- If `@mui/x-license` was added, call `LicenseInfo.setLicenseKey()` in your app entry point
- Add `showToolbar` prop to DataGrid if a toolbar was previously visible
- Update `rowSelectionModel` state: type changed from `array` to `{ type, ids: Set }`
- Run official codemods for remaining issues:
  ```bash
  npx @mui/x-codemod@latest v8.0.0/preset-safe <path>
  npx @mui/codemod@latest deprecations/all <path>
  ```
- Ensure TypeScript >= 5.0

### v6 → v7 — additional steps

- Audit `Grid` / `GridLegacy` usage — verify container/item props work as expected
- Refactor `Hidden` / `PigmentHidden` with `sx` breakpoints or `useMediaQuery`
- Run lab codemod: `npx @mui/codemod@latest v7.0.0/lab-removed-components <path>`
- Ensure TypeScript >= 4.9

### v5 → v6 — additional steps

- Consider adopting `theme.applyStyles()` for dark-mode theming
- Opt in to CSS variables: https://mui.com/material-ui/customization/css-theme-variables/

## Development

```bash
npm install
npm test          # run all tests (Jest with ESM support)
```

Tests live in `tests/` and cover per-transformer unit tests and full integration tests against fixture projects in `tests/fixtures/`.

## License

MIT
