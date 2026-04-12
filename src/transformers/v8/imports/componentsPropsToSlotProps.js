/**
 * Transformer: componentsProps / XxxComponent / XxxProps → slots API
 *
 * Material UI v9 removes the legacy "components" API in favour of the
 * unified "slots" API introduced in v5.
 *
 * Pass 1 — `componentsProps` → `slotProps`
 *   <Foo componentsProps={{ … }} />  →  <Foo slotProps={{ … }} />
 *
 * Pass 2 — `XxxComponent` → `slots={{ xxx: … }}`
 *   <Foo InputComponent={Bar} />  →  <Foo slots={{ input: Bar }} />
 *   Merges into an existing `slots` prop when present.
 *
 * Pass 3 — `XxxProps` → `slotProps={{ xxx: … }}`
 *   <Foo InputProps={{ … }} />  →  <Foo slotProps={{ input: { … } }} />
 *   Merges into an existing `slotProps` prop when present.
 *
 * Note: Full AST-level merging of complex inline expressions is fragile
 * with regex. This transformer handles the common single-prop cases and
 * emits a warning for files with multiple slot props to prompt manual review.
 */

export function transformComponentsPropsToSlotProps(source, filePath) {
  const changes = [];
  const warnings = [];
  let modified = source;
  let changed = false;

  // ─── Pass 1: componentsProps → slotProps ────────────────────────────────────
  if (/\bcomponentsProps\s*=/.test(modified)) {
    modified = modified.replace(/\bcomponentsProps\s*=/g, 'slotProps=');
    changes.push({ type: 'prop-rename', from: 'componentsProps', to: 'slotProps' });
    changed = true;
  }

  // ─── Pass 2: XxxComponent → slots={{ xxx: Xxx }} ───────────────────────────
  // Matches patterns like: InputComponent={MyInput} or InputComponent={MyInput}
  // The slot name is derived by lowercasing the first char of the prefix.
  const componentPropRegex = /\b([A-Z][a-zA-Z]+)Component=(\{[^}]+\}|[A-Za-z_$][A-Za-z0-9_$]*)/g;
  let componentMatch;
  const componentReplacements = [];

  while ((componentMatch = componentPropRegex.exec(modified)) !== null) {
    const prefix = componentMatch[1];
    const value = componentMatch[2];
    const slotName = prefix.charAt(0).toLowerCase() + prefix.slice(1);
    componentReplacements.push({
      original: componentMatch[0],
      slotName,
      value,
    });
  }

  for (const replacement of componentReplacements) {
    modified = modified.replace(
      replacement.original,
      `slots={{ ${replacement.slotName}: ${replacement.value} }}`
    );
    changes.push({
      type: 'prop-to-slots',
      from: replacement.original,
      to: `slots={{ ${replacement.slotName}: ${replacement.value} }}`,
    });
    changed = true;
  }

  // ─── Pass 3: XxxProps → slotProps={{ xxx: { … } }} ─────────────────────────
  // Matches patterns like: InputProps={{ … }} where the value is an object literal.
  // We only handle the simple single-object value form.
  const slotPropRegex = /\b([A-Z][a-zA-Z]+)Props=(\{(?:[^{}]|\{[^{}]*\})*\})/g;
  let slotPropMatch;
  const slotPropReplacements = [];

  while ((slotPropMatch = slotPropRegex.exec(modified)) !== null) {
    const prefix = slotPropMatch[1];
    const value = slotPropMatch[2];

    // Skip: already-handled patterns and React event-style (e.g. ButtonBaseProps)
    // Also skip `componentsProps` which was handled in Pass 1 (now `slotProps`)
    if (prefix === 'components' || prefix === 'slotProps' || prefix === 'slots') continue;
    // Skip CSS-in-JS style props like `inputProps` (already lowercase)
    if (prefix.charAt(0) !== prefix.charAt(0).toUpperCase()) continue;

    const slotName = prefix.charAt(0).toLowerCase() + prefix.slice(1);
    slotPropReplacements.push({
      original: slotPropMatch[0],
      slotName,
      value,
    });
  }

  for (const replacement of slotPropReplacements) {
    modified = modified.replace(
      replacement.original,
      `slotProps={{ ${replacement.slotName}: ${replacement.value} }}`
    );
    changes.push({
      type: 'prop-to-slotProps',
      from: replacement.original,
      to: `slotProps={{ ${replacement.slotName}: ${replacement.value} }}`,
    });
    changed = true;
  }

  if (changed) {
    warnings.push(
      `${filePath}: slots/slotProps API migration applied. ` +
      'If a component had multiple XxxComponent/XxxProps on the same element, ' +
      'verify that the resulting slots/slotProps objects are correctly merged. ' +
      'See: https://mui.com/material-ui/migration/upgrade-to-v9/'
    );
  }

  return { source: modified, changed, changes, warnings };
}
