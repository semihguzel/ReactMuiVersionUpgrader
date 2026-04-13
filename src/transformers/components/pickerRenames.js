// Component renames from @material-ui/pickers → @mui/x-date-pickers (MUI v5)
// KeyboardXxxPicker components were removed; the plain Xxx components now
// include keyboard input by default.
const renames = {
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

/**
 * Renames legacy @material-ui/pickers Keyboard* components to their
 * @mui/x-date-pickers equivalents.
 *
 * Handles:
 *   - Import specifiers
 *   - JSX opening/closing tags and self-closing tags
 *   - TypeScript type references (XxxProps)
 *
 * Note: KeyboardDateTimePicker must be checked before KeyboardDatePicker /
 * KeyboardTimePicker to avoid a partial match replacing the shorter prefix
 * first (word-boundary regex prevents this, but ordering is kept for clarity).
 */
export function transformPickerRenames(source, filePath) {
  let changed = false;
  const changes = [];
  let result = source;

  const hasAny = Object.keys(renames).some(old => result.includes(old));
  if (!hasAny) return { source, changed: false, changes: [] };

  for (const [oldName, newName] of Object.entries(renames)) {
    const pattern = new RegExp(`\\b${oldName}\\b`, 'g');
    if (pattern.test(result)) {
      result = result.replace(pattern, newName);
      changed = true;
      changes.push({ type: 'component-rename', from: oldName, to: newName });
    }
  }

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
