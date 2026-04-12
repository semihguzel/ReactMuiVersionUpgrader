const renames = {
  GridList: 'ImageList',
  GridListTile: 'ImageListItem',
  GridListTileBar: 'ImageListItemBar',
};

const typeRenames = {
  GridListProps: 'ImageListProps',
  GridListTileProps: 'ImageListItemProps',
  GridListTileBarProps: 'ImageListItemBarProps',
};

// Props that need renaming on ImageList (was GridList)
const propRenames = {
  spacing: 'gap',
  cellHeight: 'rowHeight',
};

/**
 * Renames GridList components to ImageList and updates related props.
 */
export function transformGridListToImageList(source, filePath) {
  let changed = false;
  const changes = [];
  let result = source;

  const hasGridList = Object.keys(renames).some(old => result.includes(old));
  if (!hasGridList) return { source, changed: false, changes: [] };

  // Rename component names
  for (const [oldName, newName] of Object.entries(renames)) {
    const pattern = new RegExp(`\\b${oldName}\\b`, 'g');
    if (pattern.test(result)) {
      result = result.replace(pattern, newName);
      changed = true;
      changes.push({
        type: 'component-rename',
        from: oldName,
        to: newName,
      });
    }
  }

  // Rename type names
  for (const [oldType, newType] of Object.entries(typeRenames)) {
    const pattern = new RegExp(`\\b${oldType}\\b`, 'g');
    if (pattern.test(result)) {
      result = result.replace(pattern, newType);
      changed = true;
      changes.push({
        type: 'type-rename',
        from: oldType,
        to: newType,
      });
    }
  }

  // Rename props on ImageList components
  // Match: <ImageList spacing={...} → <ImageList gap={...}
  // Match: <ImageList cellHeight={...} → <ImageList rowHeight={...}
  for (const [oldProp, newProp] of Object.entries(propRenames)) {
    // Match prop in JSX context after ImageList tag
    const propPattern = new RegExp(
      `(<ImageList[^>]*?)\\b${oldProp}\\b(\\s*=)`,
      'g'
    );
    if (propPattern.test(result)) {
      result = result.replace(propPattern, `$1${newProp}$2`);
      changed = true;
      changes.push({
        type: 'prop-rename',
        component: 'ImageList',
        from: oldProp,
        to: newProp,
      });
    }
  }

  return { source: result, changed, changes };
}
