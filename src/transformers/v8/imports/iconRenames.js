/**
 * Transformer: Legacy "Outline" (without trailing 'd') icon renames (MUI v9)
 *
 * Material UI v9 removes legacy icon exports whose names end in "Outline"
 * without the trailing 'd'. These were duplicates of their correct "Outlined"
 * counterparts (e.g. InfoOutline → InfoOutlined).
 *
 * This transformer renames those identifiers in both import statements and JSX.
 */

// Comprehensive list of icons whose name ends in "Outline" (no 'd') that were
// removed in MUI v9. Each maps directly to <Name>d (add a 'd').
const OUTLINE_ICONS = [
  'AcUnitOutline',
  'AccessAlarmOutline',
  'AccessAlarmsOutline',
  'AccessibilityOutline',
  'AccessibleOutline',
  'AccountBoxOutline',
  'AccountCircleOutline',
  'AdbOutline',
  'AddAPhotoOutline',
  'AddAlarmOutline',
  'AddAlertOutline',
  'AddBoxOutline',
  'AddCommentOutline',
  'AddIcCallOutline',
  'AddLocationOutline',
  'AddPhotoAlternateOutline',
  'AddShoppingCartOutline',
  'AddToHomeScreenOutline',
  'AddToPhotosOutline',
  'AddToQueueOutline',
  'HomeOutline',
  'InfoOutline',
  'SettingsOutline',
];

export function transformIconRenames(source, filePath) {
  const changes = [];
  const warnings = [];
  let modified = source;
  let changed = false;

  for (const iconName of OUTLINE_ICONS) {
    const renamedIcon = `${iconName}d`; // simply append 'd'
    // Only rename exact word-boundary matches to avoid partial matches
    const regex = new RegExp(`\\b${iconName}\\b`, 'g');
    if (regex.test(modified)) {
      modified = modified.replace(new RegExp(`\\b${iconName}\\b`, 'g'), renamedIcon);
      changes.push({ type: 'identifier-rename', from: iconName, to: renamedIcon });
      changed = true;
    }
  }

  return { source: modified, changed, changes, warnings };
}
