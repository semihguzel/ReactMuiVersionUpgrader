/**
 * Transformer: Warn-only pass for removed APIs in MUI v7→v8/v9
 *
 * These APIs were removed with no automated safe fix.
 * The transformer detects their presence and emits warnings that
 * are included in the migration report for manual resolution.
 */

import { v8RemovedAPIs } from '../../../data/v8/propRenames.js';

export function transformRemovedApis(source, filePath) {
  const changes = [];
  const warnings = [];
  const changed = false; // warn-only — source is never modified

  for (const api of v8RemovedAPIs) {
    if (api.pattern.test(source)) {
      warnings.push(
        `${filePath}: ${api.message}`
      );
    }
  }

  return { source, changed, changes, warnings };
}
