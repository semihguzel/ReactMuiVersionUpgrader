import { transformLicenseInfo } from './imports/licenseInfo.js';
import { transformComponentsPropsToSlotProps } from './imports/componentsPropsToSlotProps.js';
import { transformIconRenames } from './imports/iconRenames.js';
import { transformUnstableFeatures } from './imports/unstableFeatures.js';
import { transformHookRenames } from './imports/hookRenames.js';
import { transformSelectorRenames } from './imports/selectorRenames.js';
import { transformGridSizeProps } from './props/gridSizeProps.js';
import { transformRemovedApis } from './warnings/removedApis.js';

/**
 * Ordered transformer pipeline for MUI v7 → v8/v9 migration.
 *
 * Each entry follows the same shape as the v4→v5, v5→v6, and v6→v7 pipelines:
 *   { name: string, phase: string, fn: (source, filePath) => Result }
 *
 * Phase ordering rationale:
 *   1. licenseInfo            — must run first; changes import sources
 *   2. componentsPropsToSlotProps — rename component/props API
 *   3. iconRenames            — simple identifier renames
 *   4. unstableFeatures       — DataGrid prop/method renames
 *   5. hookRenames            — DataGrid hook renames
 *   6. selectorRenames        — selector / type / Tree View renames
 *   7. gridSizeProps          — JSX prop restructure (runs after import phase)
 *   8. removedApis            — warn-only, always last
 */
export const v8TransformerPipeline = [
  // Phase 1: Import source changes
  { name: 'licenseInfo',               phase: 'imports',   fn: transformLicenseInfo },

  // Phase 2: Component API (slots)
  { name: 'componentsPropsToSlotProps', phase: 'imports',   fn: transformComponentsPropsToSlotProps },

  // Phase 3: Identifier renames
  { name: 'iconRenames',               phase: 'imports',   fn: transformIconRenames },
  { name: 'unstableFeatures',          phase: 'imports',   fn: transformUnstableFeatures },
  { name: 'hookRenames',               phase: 'imports',   fn: transformHookRenames },
  { name: 'selectorRenames',           phase: 'imports',   fn: transformSelectorRenames },

  // Phase 4: JSX prop restructuring
  { name: 'gridSizeProps',             phase: 'props',     fn: transformGridSizeProps },

  // Phase 5: Warn-only (always last)
  { name: 'removedApis',               phase: 'warnings',  fn: transformRemovedApis },
];
