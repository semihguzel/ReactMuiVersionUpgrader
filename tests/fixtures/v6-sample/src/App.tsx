import React from 'react';
import { Button, StyledEngineProvider, Hidden } from '@mui/material';
import { Grid, Grid2 } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import createTheme from '@mui/material/styles/createTheme';
import TablePaginationActions from '@mui/material/TablePagination/TablePaginationActions';
import { Alert } from '@mui/lab';

const theme = createTheme({ palette: { mode: 'dark' } });

export default function App() {
  return (
    <StyledEngineProvider injectFirst>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Grid2 item xs={6}>
            <Button size="normal">Click me</Button>
            <InputLabel size="normal">Label</InputLabel>
          </Grid2>
        </Grid>
      </Grid>
      <Hidden mdDown>
        <p>Hidden on mobile</p>
      </Hidden>
    </StyledEngineProvider>
  );
}
