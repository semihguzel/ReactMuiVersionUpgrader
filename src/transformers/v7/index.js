import { transformDeepImportPaths } from './imports/deepImportPaths.js';
import { transformStyledEngineProvider } from './imports/styledEngineProvider.js';
import { transformGridRename } from './imports/gridRename.js';
import { transformInputLabelSize } from './props/inputLabelSize.js';
import { transformLabRemovedComponents } from './imports/labRemovedComponents.js';
import { transformRemovedApis } from './warnings/removedApis.js';

/**
 * Ordered transformer pipeline for MUI v6 → v7 migration.
 * Each entry follows the same shape as the v4→v5 and v5→v6 pipelines.
 */
export const v7TransformerPipeline = [
  // Phase 1: Import path fixes (must run before component renames)
  { name: 'deepImportPaths',      phase: 'imports',   fn: transformDeepImportPaths },
  { name: 'styledEngineProvider', phase: 'imports',   fn: transformStyledEngineProvider },

  // Phase 2: Grid rename — Grid→GridLegacy THEN Grid2→Grid (both in one transformer)
  { name: 'gridRename',           phase: 'imports',   fn: transformGridRename },

  // Phase 3: Prop value fixes
  { name: 'inputLabelSize',       phase: 'props',     fn: transformInputLabelSize },

  // Phase 4: Warn-only passes
  { name: 'labRemovedComponents', phase: 'imports',   fn: transformLabRemovedComponents },
  { name: 'removedApis',          phase: 'warnings',  fn: transformRemovedApis },
];
