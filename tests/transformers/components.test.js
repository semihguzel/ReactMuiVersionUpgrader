import { describe, it, expect } from '@jest/globals';
import { transformExpansionToAccordion } from '../../src/transformers/components/expansionToAccordion.js';
import { transformGridListToImageList } from '../../src/transformers/components/gridListToImageList.js';
import { transformRootRefRemoval } from '../../src/transformers/components/rootRefRemoval.js';

describe('expansionToAccordion transformer', () => {
  it('should rename ExpansionPanel to Accordion', () => {
    const input = `<ExpansionPanel>content</ExpansionPanel>`;
    const result = transformExpansionToAccordion(input, 'test.jsx');
    expect(result.changed).toBe(true);
    expect(result.source).toBe(`<Accordion>content</Accordion>`);
  });

  it('should rename all ExpansionPanel sub-components', () => {
    const input = `
import { ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails } from '@mui/material';
<ExpansionPanel>
  <ExpansionPanelSummary>Title</ExpansionPanelSummary>
  <ExpansionPanelDetails>Content</ExpansionPanelDetails>
</ExpansionPanel>`;
    const result = transformExpansionToAccordion(input, 'test.jsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('Accordion');
    expect(result.source).toContain('AccordionSummary');
    expect(result.source).toContain('AccordionDetails');
    expect(result.source).not.toContain('ExpansionPanel');
  });

  it('should rename type references', () => {
    const input = `const props: ExpansionPanelProps = {};`;
    const result = transformExpansionToAccordion(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).toBe(`const props: AccordionProps = {};`);
  });

  it('should not change files without ExpansionPanel', () => {
    const input = `<Button>Click</Button>`;
    const result = transformExpansionToAccordion(input, 'test.jsx');
    expect(result.changed).toBe(false);
  });
});

describe('gridListToImageList transformer', () => {
  it('should rename GridList to ImageList', () => {
    const input = `<GridList>items</GridList>`;
    const result = transformGridListToImageList(input, 'test.jsx');
    expect(result.changed).toBe(true);
    expect(result.source).toBe(`<ImageList>items</ImageList>`);
  });

  it('should rename GridListTile to ImageListItem', () => {
    const input = `<GridListTile>item</GridListTile>`;
    const result = transformGridListToImageList(input, 'test.jsx');
    expect(result.changed).toBe(true);
    expect(result.source).toBe(`<ImageListItem>item</ImageListItem>`);
  });
});

describe('rootRefRemoval transformer', () => {
  it('should remove RootRef from named import and add ref to child', () => {
    const input = `import { Button, RootRef } from '@material-ui/core';
<RootRef rootRef={myRef}><div /></RootRef>`;
    const result = transformRootRefRemoval(input, 'test.jsx');
    expect(result.changed).toBe(true);
    expect(result.source).not.toContain('RootRef');
    expect(result.source).toContain('ref={myRef}');
  });

  it('should remove import entirely when RootRef is the only specifier', () => {
    const input = `import { RootRef } from '@material-ui/core';
<RootRef rootRef={ref}><span /></RootRef>`;
    const result = transformRootRefRemoval(input, 'test.jsx');
    expect(result.changed).toBe(true);
    expect(result.source).not.toContain('RootRef');
    expect(result.source).toContain('ref={ref}');
  });

  it('should remove default import from deep path', () => {
    const input = `import RootRef from '@material-ui/core/RootRef';`;
    const result = transformRootRefRemoval(input, 'test.jsx');
    expect(result.changed).toBe(true);
    expect(result.source.trim()).toBe('');
  });

  it('should add TODO comment for complex (non-JSX-element) children', () => {
    const input = `<RootRef rootRef={ref}>{complexChildren}</RootRef>`;
    const result = transformRootRefRemoval(input, 'test.jsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('TODO');
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('should not change files without RootRef', () => {
    const input = `<Button>Click me</Button>`;
    const result = transformRootRefRemoval(input, 'test.jsx');
    expect(result.changed).toBe(false);
  });
});
