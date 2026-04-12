import { v7RemovedAPIs } from '../../../data/v7/propRenames.js';

/**
 * Transformer: Warn about removed APIs in MUI v7 (warn-only).
 *
 * Detects usage of APIs that have no safe automated fix:
 *   - onBackdropClick prop (Modal/Dialog)
 *   - experimentalStyled
 *   - Hidden component
 *   - PigmentHidden component
 *   - MuiRating-readOnly CSS class
 *   - StepButtonIcon TypeScript type
 *
 * Always returns changed: false — this is a warning-only transformer.
 */
export function transformRemovedApis(source, filePath) {
  const warnings = [];

  for (const api of v7RemovedAPIs) {
    if (api.pattern.test(source)) {
      // Find approximate line number for the first match
      const lines = source.split('\n');
      let lineNumber = null;
      for (let i = 0; i < lines.length; i++) {
        if (api.pattern.test(lines[i])) {
          lineNumber = i + 1;
          break;
        }
      }

      const location = lineNumber ? `${filePath}:${lineNumber}` : filePath;
      warnings.push(
        `${location}: ${api.message} See: ${api.docsUrl}`
      );
    }
  }

  return { source, changed: false, changes: [], warnings };
}
