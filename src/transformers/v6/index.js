import { transformGrid2Rename } from './imports/grid2Rename.js';
import { transformSlotsProps } from './props/slotsProps.js';
import { transformAccordionSlots } from './props/accordionSlots.js';
import { transformListItemButton } from './props/listItemButton.js';
import { transformListItemTextSlots } from './props/listItemTextSlots.js';
import { transformSystemProps } from './props/systemProps.js';
import { transformVariantDefaultsV6 } from './props/variantDefaultsV6.js';
import { transformApplyStyles } from './theme/applyStyles.js';

/**
 * Ordered transformer pipeline for MUI v5 → v6 migration.
 * Each entry follows the same shape as the v4→v5 pipeline in ../index.js.
 */
export const v6TransformerPipeline = [
  // Phase 1: Import renames
  { name: 'grid2Rename', phase: 'imports', fn: transformGrid2Rename },

  // Phase 2: Component-level slot prop migrations
  { name: 'slotsProps', phase: 'props', fn: transformSlotsProps },
  { name: 'accordionSlots', phase: 'props', fn: transformAccordionSlots },
  { name: 'listItemTextSlots', phase: 'props', fn: transformListItemTextSlots },

  // Phase 3: Component replacements
  { name: 'listItemButton', phase: 'components', fn: transformListItemButton },

  // Phase 4: System props deprecation
  { name: 'systemProps', phase: 'props', fn: transformSystemProps },

  // Phase 5: Variant warnings
  { name: 'variantDefaultsV6', phase: 'props', fn: transformVariantDefaultsV6 },

  // Phase 6: Theme warnings
  { name: 'applyStyles', phase: 'theme', fn: transformApplyStyles },
];
