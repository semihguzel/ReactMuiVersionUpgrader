import { requiredDependencies } from '../data/packageMappings.js';

/**
 * Adds @emotion/react and @emotion/styled if not already present.
 */
export function addEmotionDependencies(packageJson, scanResult) {
  const changes = [];
  const modified = JSON.parse(JSON.stringify(packageJson));

  if (scanResult.hasEmotion) {
    return { packageJson: modified, changes };
  }

  if (!modified.dependencies) modified.dependencies = {};

  for (const [name, version] of Object.entries(requiredDependencies)) {
    if (!modified.dependencies[name] && !modified.devDependencies?.[name]) {
      modified.dependencies[name] = version;
      changes.push({
        type: 'add-dependency',
        package: name,
        version,
        reason: 'MUI v5 default styling engine',
      });
    }
  }

  return { packageJson: modified, changes };
}
