import { describe, it, expect } from '@jest/globals';
import { transformExpansionToAccordion } from '../../src/transformers/components/expansionToAccordion.js';
import { transformGridListToImageList } from '../../src/transformers/components/gridListToImageList.js';

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
