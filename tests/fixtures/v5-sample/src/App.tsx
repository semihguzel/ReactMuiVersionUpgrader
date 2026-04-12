/**
 * v5-sample/src/App.tsx
 *
 * Sample MUI v5 codebase that exercises all v5→v6 transformers.
 */

import React from 'react';
import { Button, Modal, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { ListItem, ListItemText, Box, Typography, TextField, Select, MenuItem } from '@mui/material';
import { Unstable_Grid2 } from '@mui/material';
import Grid2Comp from '@mui/material/Unstable_Grid2';

// grid2Rename: Unstable_Grid2 → Grid2 in JSX
function GridExample() {
  return (
    <Unstable_Grid2 container spacing={2}>
      <Unstable_Grid2 item disableEqualOverflow xs={6}>
        <Typography>Column</Typography>
      </Unstable_Grid2>
    </Unstable_Grid2>
  );
}

// slotsProps: components/componentsProps → slots/slotProps on Modal
function ModalExample() {
  return (
    <Modal
      components={{ backdrop: CustomBackdrop }}
      componentsProps={{ backdrop: { invisible: true } }}
      open={true}
    >
      <div>Content</div>
    </Modal>
  );
}

// accordionSlots: TransitionComponent/TransitionProps on Accordion
function AccordionExample() {
  return (
    <Accordion TransitionComponent={Fade} TransitionProps={{ unmountOnExit: true }}>
      <AccordionSummary>Title</AccordionSummary>
      <AccordionDetails>Content</AccordionDetails>
    </Accordion>
  );
}

// listItemButton: <ListItem button> → <ListItemButton>
function ListExample() {
  return (
    <ListItem button>
      <ListItemText primary="Item" />
    </ListItem>
  );
}

// listItemTextSlots: primaryTypographyProps → slotProps.primary
function ListItemTextExample() {
  return (
    <ListItemText
      primaryTypographyProps={{ variant: 'h6' }}
      secondaryTypographyProps={{ color: 'text.secondary' }}
      primary="Title"
      secondary="Subtitle"
    />
  );
}

// systemProps: mt, mb on Box → sx
function BoxExample() {
  return (
    <Box mt={2} mb={4}>
      <Typography>Content</Typography>
    </Box>
  );
}

// variantDefaultsV6: TextField/Select without variant prop (warns only)
function FormExample() {
  return (
    <div>
      <TextField label="Name" />
      <Select value="a">
        <MenuItem value="a">A</MenuItem>
      </Select>
    </div>
  );
}

// applyStyles: palette.mode comparison (warns only)
function ThemeExample({ theme }) {
  const isDark = theme.palette.mode === 'dark';
  return <div style={{ background: isDark ? '#000' : '#fff' }}>Content</div>;
}

export default function App() {
  return (
    <div>
      <GridExample />
      <ModalExample />
      <AccordionExample />
      <ListExample />
      <ListItemTextExample />
      <BoxExample />
      <FormExample />
    </div>
  );
}
