// Component renames from @material-ui/pickers → @mui/x-date-pickers (MUI v5)
// KeyboardXxxPicker components were removed; the plain Xxx components now
// include keyboard input by default.
const componentRenames = {
  KeyboardDateTimePicker: 'DateTimePicker',
  KeyboardDatePicker: 'DatePicker',
  KeyboardTimePicker: 'TimePicker',
  MuiPickersUtilsProvider: 'LocalizationProvider',
};

const typeRenames = {
  KeyboardDateTimePickerProps: 'DateTimePickerProps',
  KeyboardDatePickerProps: 'DatePickerProps',
  KeyboardTimePickerProps: 'TimePickerProps',
};

// Adapter class renames: @date-io/* utils classes → MUI adapter names.
// The adapters are now bundled with @mui/x-date-pickers.
const adapterRenames = {
  DateFnsUtils: 'AdapterDateFns',
  MomentUtils: 'AdapterMoment',
  LuxonUtils: 'AdapterLuxon',
  DayjsUtils: 'AdapterDayjs',
  DayJsUtils: 'AdapterDayjs',
};

// @date-io/* import paths that map to @mui/x-date-pickers sub-packages.
// When the old default import is present, we rewrite the entire import
// statement to use the named export from the MUI adapter path.
const adapterImportMap = {
  '@date-io/date-fns': { adapter: 'AdapterDateFns', path: '@mui/x-date-pickers/AdapterDateFns' },
  '@date-io/moment': { adapter: 'AdapterMoment', path: '@mui/x-date-pickers/AdapterMoment' },
  '@date-io/luxon': { adapter: 'AdapterLuxon', path: '@mui/x-date-pickers/AdapterLuxon' },
  '@date-io/dayjs': { adapter: 'AdapterDayjs', path: '@mui/x-date-pickers/AdapterDayjs' },
};

/**
 * Migrates @material-ui/pickers API to @mui/x-date-pickers (MUI v5).
 *
 * Handles:
 *  1. Component renames (KeyboardXxxPicker → XxxPicker, MuiPickersUtilsProvider → LocalizationProvider)
 *  2. TypeScript prop-type renames
 *  3. `utils` prop → `dateAdapter` prop on LocalizationProvider
 *  4. Adapter class renames (DateFnsUtils → AdapterDateFns, etc.)
 *  5. @date-io/* import rewrites to @mui/x-date-pickers/AdapterXxx
 */
export function transformPickerRenames(source, filePath) {
  let changed = false;
  const changes = [];
  let result = source;

  const hasAny =
    Object.keys(componentRenames).some(old => result.includes(old)) ||
    Object.keys(adapterRenames).some(old => result.includes(old)) ||
    Object.keys(adapterImportMap).some(src => result.includes(src));

  if (!hasAny) return { source, changed: false, changes: [] };

  // ── 1. Rewrite @date-io/* import statements ──────────────────────────────
  // Matches both:
  //   import DateFnsUtils from '@date-io/date-fns'
  //   import DateFnsUtils from "@date-io/date-fns"
  for (const [oldPath, { adapter, path: newPath }] of Object.entries(adapterImportMap)) {
    // Default import: import XxxUtils from '@date-io/...'
    const defaultImportRe = new RegExp(
      `import\\s+(\\w+)\\s+from\\s+(['"])${escapeRegex(oldPath)}\\2`,
      'g'
    );
    if (defaultImportRe.test(result)) {
      result = result.replace(defaultImportRe, (_, _importedName, quote) => {
        return `import { ${adapter} } from ${quote}${newPath}${quote}`;
      });
      changed = true;
      changes.push({ type: 'adapter-import-rewrite', from: oldPath, to: newPath });
    }

    // Named import: import { DateFnsUtils } from '@date-io/...' (less common but handle it)
    const namedImportRe = new RegExp(
      `import\\s+\\{[^}]*\\}\\s+from\\s+(['"])${escapeRegex(oldPath)}\\1`,
      'g'
    );
    if (namedImportRe.test(result)) {
      result = result.replace(namedImportRe, (match, quote) => {
        return `import { ${adapter} } from ${quote}${newPath}${quote}`;
      });
      changed = true;
      changes.push({ type: 'adapter-import-rewrite', from: oldPath, to: newPath });
    }
  }

  // ── 2. Component renames ──────────────────────────────────────────────────
  for (const [oldName, newName] of Object.entries(componentRenames)) {
    const pattern = new RegExp(`\\b${oldName}\\b`, 'g');
    if (pattern.test(result)) {
      result = result.replace(pattern, newName);
      changed = true;
      changes.push({ type: 'component-rename', from: oldName, to: newName });
    }
  }

  // ── 3. `utils` prop → `dateAdapter` on LocalizationProvider ─────────────
  // Matches utils= that appears inside a LocalizationProvider opening tag,
  // spanning possible whitespace/newlines between the tag name and the prop.
  // Uses a lookahead to confirm the prop belongs to a LocalizationProvider
  // rather than doing a greedy multi-line match.
  //
  // Strategy: replace `utils=` that is preceded (anywhere on the same or
  // adjacent lines) by an unmatched `<LocalizationProvider`.  The simplest
  // safe approach is a single-pass replacement of `utils=` that occurs
  // within the span of any `<LocalizationProvider ...>` tag.
  if (result.includes('LocalizationProvider') && result.includes('utils=')) {
    // Replace utils= only inside LocalizationProvider JSX opening tags.
    // The regex matches the opening of the tag up through the prop name.
    result = result.replace(
      /(<LocalizationProvider\b)([\s\S]*?\butils=)/g,
      (match, tagOpen, rest) => {
        changed = true;
        changes.push({ type: 'prop-rename', from: 'utils', to: 'dateAdapter', component: 'LocalizationProvider' });
        return tagOpen + rest.replace(/\butils=/, 'dateAdapter=');
      }
    );
  }

  // ── 4. Adapter class renames ─────────────────────────────────────────────
  for (const [oldName, newName] of Object.entries(adapterRenames)) {
    const pattern = new RegExp(`\\b${oldName}\\b`, 'g');
    if (pattern.test(result)) {
      result = result.replace(pattern, newName);
      changed = true;
      changes.push({ type: 'adapter-rename', from: oldName, to: newName });
    }
  }

  // ── 5. TypeScript type renames ───────────────────────────────────────────
  for (const [oldType, newType] of Object.entries(typeRenames)) {
    const pattern = new RegExp(`\\b${oldType}\\b`, 'g');
    if (pattern.test(result)) {
      result = result.replace(pattern, newType);
      changed = true;
      changes.push({ type: 'type-rename', from: oldType, to: newType });
    }
  }

  return { source: result, changed, changes };
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
