/**
 * MUI v6 → v7 component renames.
 *
 * In v7:
 *   - Grid2 (the stabilized new grid from v6) becomes Grid
 *   - Grid  (the old legacy grid from v5/v6) becomes GridLegacy
 *
 * These are NOT applied directly from this map — the transformer sequences
 * them internally (Grid→GridLegacy first, then Grid2→Grid) to avoid collision.
 */
export const v7GridImportRenames = {
  '@mui/material/Grid':  '@mui/material/GridLegacy',
  '@mui/material/Grid2': '@mui/material/Grid',
};
