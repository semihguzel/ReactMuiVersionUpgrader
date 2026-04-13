import { describe, it, expect } from '@jest/globals';
import { transformExpansionToAccordion } from '../../src/transformers/components/expansionToAccordion.js';
import { transformGridListToImageList } from '../../src/transformers/components/gridListToImageList.js';
import { transformRootRefRemoval } from '../../src/transformers/components/rootRefRemoval.js';
import { transformPickerRenames } from '../../src/transformers/components/pickerRenames.js';

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

describe('pickerRenames transformer', () => {
  it('should rename KeyboardDatePicker to DatePicker', () => {
    const input = `import { KeyboardDatePicker } from '@mui/x-date-pickers';
<KeyboardDatePicker value={date} onChange={setDate} />`;
    const result = transformPickerRenames(input, 'test.jsx');
    expect(result.changed).toBe(true);
    expect(result.source).not.toContain('KeyboardDatePicker');
    expect(result.source).toContain('DatePicker');
  });

  it('should rename KeyboardTimePicker to TimePicker', () => {
    const input = `<KeyboardTimePicker value={time} onChange={setTime} />`;
    const result = transformPickerRenames(input, 'test.jsx');
    expect(result.changed).toBe(true);
    expect(result.source).toBe(`<TimePicker value={time} onChange={setTime} />`);
  });

  it('should rename KeyboardDateTimePicker to DateTimePicker', () => {
    const input = `<KeyboardDateTimePicker value={dt} onChange={setDt} />`;
    const result = transformPickerRenames(input, 'test.jsx');
    expect(result.changed).toBe(true);
    expect(result.source).toBe(`<DateTimePicker value={dt} onChange={setDt} />`);
  });

  it('should rename MuiPickersUtilsProvider to LocalizationProvider', () => {
    const input = `import { MuiPickersUtilsProvider } from '@mui/x-date-pickers';
<MuiPickersUtilsProvider utils={DateFnsUtils}>
  <App />
</MuiPickersUtilsProvider>`;
    const result = transformPickerRenames(input, 'test.jsx');
    expect(result.changed).toBe(true);
    expect(result.source).not.toContain('MuiPickersUtilsProvider');
    expect(result.source).toContain('LocalizationProvider');
  });

  it('should rename TypeScript prop types', () => {
    const input = `const props: KeyboardDatePickerProps = {};
const tProps: KeyboardTimePickerProps = {};
const dtProps: KeyboardDateTimePickerProps = {};`;
    const result = transformPickerRenames(input, 'test.tsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('DatePickerProps');
    expect(result.source).toContain('TimePickerProps');
    expect(result.source).toContain('DateTimePickerProps');
    expect(result.source).not.toContain('KeyboardDatePickerProps');
    expect(result.source).not.toContain('KeyboardTimePickerProps');
    expect(result.source).not.toContain('KeyboardDateTimePickerProps');
  });

  it('should handle import specifiers', () => {
    const input = `import { KeyboardDatePicker, KeyboardTimePicker, KeyboardDateTimePicker, MuiPickersUtilsProvider } from '@mui/x-date-pickers';`;
    const result = transformPickerRenames(input, 'test.jsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('DatePicker');
    expect(result.source).toContain('TimePicker');
    expect(result.source).toContain('DateTimePicker');
    expect(result.source).toContain('LocalizationProvider');
    expect(result.source).not.toContain('Keyboard');
    expect(result.source).not.toContain('MuiPickersUtilsProvider');
  });

  it('should rename utils prop to dateAdapter on LocalizationProvider (single-line)', () => {
    const input = `<LocalizationProvider utils={DateFnsUtils}>`;
    const result = transformPickerRenames(input, 'test.jsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('dateAdapter=');
    expect(result.source).not.toContain('utils=');
  });

  it('should rename utils prop to dateAdapter on LocalizationProvider (multi-line)', () => {
    const input = `<LocalizationProvider\n  utils={DateFnsUtils}\n>`;
    const result = transformPickerRenames(input, 'test.jsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('dateAdapter=');
    expect(result.source).not.toContain('utils=');
  });

  it('should rename utils prop when MuiPickersUtilsProvider is in the same file (renamed first)', () => {
    const input = `<MuiPickersUtilsProvider utils={DateFnsUtils}><App /></MuiPickersUtilsProvider>`;
    const result = transformPickerRenames(input, 'test.jsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('LocalizationProvider');
    expect(result.source).toContain('dateAdapter=');
    expect(result.source).not.toContain('utils=');
  });

  it('should rewrite @date-io/date-fns default import to MUI adapter', () => {
    const input = `import DateFnsUtils from '@date-io/date-fns';`;
    const result = transformPickerRenames(input, 'test.jsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain("from '@mui/x-date-pickers/AdapterDateFns'");
    expect(result.source).toContain('AdapterDateFns');
    expect(result.source).not.toContain("'@date-io/date-fns'");
  });

  it('should rewrite @date-io/moment default import to MUI adapter', () => {
    const input = `import MomentUtils from '@date-io/moment';`;
    const result = transformPickerRenames(input, 'test.jsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain("from '@mui/x-date-pickers/AdapterMoment'");
    expect(result.source).toContain('AdapterMoment');
  });

  it('should rename DateFnsUtils identifier to AdapterDateFns', () => {
    const input = `<LocalizationProvider dateAdapter={DateFnsUtils}>`;
    const result = transformPickerRenames(input, 'test.jsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('AdapterDateFns');
    expect(result.source).not.toContain('DateFnsUtils');
  });

  it('should handle full migration of a LocalizationProvider usage', () => {
    const input = `import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';

<MuiPickersUtilsProvider utils={DateFnsUtils}>
  <App />
</MuiPickersUtilsProvider>`;
    const result = transformPickerRenames(input, 'test.jsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain('LocalizationProvider');
    expect(result.source).toContain('dateAdapter={AdapterDateFns}');
    expect(result.source).toContain("from '@mui/x-date-pickers/AdapterDateFns'");
    expect(result.source).not.toContain('MuiPickersUtilsProvider');
    expect(result.source).not.toContain('utils=');
    expect(result.source).not.toContain('DateFnsUtils');
  });

  it('should not rename plain DatePicker, TimePicker, DateTimePicker', () => {
    const input = `<DatePicker value={d} /><TimePicker value={t} /><DateTimePicker value={dt} />`;
    const result = transformPickerRenames(input, 'test.jsx');
    expect(result.changed).toBe(false);
  });

  it('should not change files without picker components', () => {
    const input = `<Button>Click</Button>`;
    const result = transformPickerRenames(input, 'test.jsx');
    expect(result.changed).toBe(false);
  });
});
