import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'fs';
import { join, dirname, relative, basename } from 'path';

// v6 transformer pipeline
import { v6TransformerPipeline } from './v6/index.js';

// v7 transformer pipeline
import { v7TransformerPipeline } from './v7/index.js';

// v8 transformer pipeline
import { v8TransformerPipeline } from './v8/index.js';

// Import transformers
import { transformPackageRenames } from './imports/packageRename.js';
import { transformLabToCore } from './imports/labToCore.js';
import { transformColorImports } from './imports/colorImports.js';

// Component transformers
import { transformExpansionToAccordion } from './components/expansionToAccordion.js';
import { transformGridListToImageList } from './components/gridListToImageList.js';
import { transformRootRefRemoval } from './components/rootRefRemoval.js';
import { transformPickerRenames } from './components/pickerRenames.js';

// Prop transformers
import { transformGenericProps } from './props/genericPropRename.js';
import { transformVariantDefaults } from './props/variantDefaults.js';
import { transformLinkUnderline } from './props/linkUnderline.js';

// Theme transformers
import { transformCreateTheme } from './theme/createTheme.js';
import { transformPaletteMode } from './theme/paletteMode.js';
import { transformFadeToAlpha } from './theme/fadeToAlpha.js';
import { transformThemeStructure } from './theme/themeStructure.js';

// Style transformers
import { transformJssClasses } from './styles/jssClasses.js';
import { transformMakeStylesImport } from './styles/makeStylesImport.js';

// Ordered list of all transformers
const transformerPipeline = [
  // Phase 1: Imports (must run first)
  { name: 'packageRename', phase: 'imports', fn: transformPackageRenames },
  { name: 'labToCore', phase: 'imports', fn: transformLabToCore },
  { name: 'colorImports', phase: 'imports', fn: transformColorImports },

  // Phase 2: Component renames
  { name: 'expansionToAccordion', phase: 'components', fn: transformExpansionToAccordion },
  { name: 'gridListToImageList', phase: 'components', fn: transformGridListToImageList },
  { name: 'rootRefRemoval', phase: 'components', fn: transformRootRefRemoval },
  { name: 'pickerRenames', phase: 'components', fn: transformPickerRenames },

  // Phase 3: Prop renames
  { name: 'genericPropRename', phase: 'props', fn: transformGenericProps },
  { name: 'variantDefaults', phase: 'props', fn: transformVariantDefaults },
  { name: 'linkUnderline', phase: 'props', fn: transformLinkUnderline },

  // Phase 4: Theme
  { name: 'createTheme', phase: 'theme', fn: transformCreateTheme },
  { name: 'paletteMode', phase: 'theme', fn: transformPaletteMode },
  { name: 'fadeToAlpha', phase: 'theme', fn: transformFadeToAlpha },
  { name: 'themeStructure', phase: 'theme', fn: transformThemeStructure },

  // Phase 5: Styles
  { name: 'jssClasses', phase: 'styles', fn: transformJssClasses },
  { name: 'makeStylesImport', phase: 'styles', fn: transformMakeStylesImport },
];

/**
 * Runs all transformers on all collected source files.
 */
export async function runTransformers(files, options = {}) {
  const skip = new Set(options.skip || []);
  const pipeline =
    options.migrationVersion === 'v7-to-v8' ? v8TransformerPipeline :
    options.migrationVersion === 'v6-to-v7' ? v7TransformerPipeline :
    options.migrationVersion === 'v5-to-v6' ? v6TransformerPipeline :
    transformerPipeline;
  const activeTransformers = pipeline.filter(t => !skip.has(t.name));

  const results = {
    filesProcessed: 0,
    filesModified: 0,
    transformations: [],
    warnings: [],
    errors: [],
  };

  for (const filePath of files) {
    let source;
    try {
      source = readFileSync(filePath, 'utf-8');
    } catch (err) {
      results.errors.push(`Failed to read ${filePath}: ${err.message}`);
      continue;
    }

    const originalSource = source;
    const fileChanges = [];
    results.filesProcessed++;

    for (const transformer of activeTransformers) {
      try {
        const result = transformer.fn(source, filePath);
        if (result.changed) {
          source = result.source;
          fileChanges.push(...(result.changes || []).map(c => ({
            ...c,
            transformer: transformer.name,
            file: filePath,
          })));
          if (result.warnings) {
            results.warnings.push(...result.warnings.map(w => ({
              message: w,
              transformer: transformer.name,
              file: filePath,
            })));
          }
        }
      } catch (err) {
        results.errors.push(
          `Transformer "${transformer.name}" failed on ${filePath}: ${err.message}`
        );
        if (options.verbose) {
          console.error(`  Error stack:`, err.stack);
        }
      }
    }

    // Write if changed
    if (source !== originalSource) {
      results.filesModified++;
      results.transformations.push(...fileChanges);

      if (!options.dryRun) {
        // Backup
        if (options.backup !== false) {
          const backupDir = join(options.targetPath, '.mui-migration-backup');
          const relPath = relative(options.targetPath, filePath);
          const backupPath = join(backupDir, relPath);
          mkdirSync(dirname(backupPath), { recursive: true });
          copyFileSync(filePath, backupPath);
        }

        writeFileSync(filePath, source, 'utf-8');
      }

      if (options.verbose) {
        const relPath = relative(options.targetPath || '', filePath);
        console.log(`  Modified: ${relPath} (${fileChanges.length} changes)`);
      }
    }
  }

  return results;
}
