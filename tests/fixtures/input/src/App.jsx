import React from 'react';
import { Button, Grid, TextField, Typography } from '@material-ui/core';
import { Alert, Skeleton } from '@material-ui/lab';
import { makeStyles, createMuiTheme, ThemeProvider, fade } from '@material-ui/core/styles';
import SaveIcon from '@material-ui/icons/Save';
import red from '@material-ui/core/colors/red';

const theme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: red[500],
    },
  },
  props: {
    MuiButton: {
      disableRipple: true,
    },
  },
  overrides: {
    MuiButton: {
      root: {
        textTransform: 'none',
      },
    },
  },
});

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    '&$focused': {
      borderColor: fade(theme.palette.primary.main, 0.5),
    },
  },
  focused: {},
}));

function App() {
  const classes = useStyles();

  return (
    <ThemeProvider theme={theme}>
      <div className={classes.root}>
        <Grid container justify="center" spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h4">MUI v4 App</Typography>
          </Grid>
          <Grid item xs={6}>
            <TextField label="Name" />
          </Grid>
          <Grid item xs={6}>
            <Button color="default" startIcon={<SaveIcon />}>
              Save
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Alert severity="info">This is an alert</Alert>
          </Grid>
          <Grid item xs={12}>
            <Skeleton variant="rect" width={210} height={118} />
          </Grid>
        </Grid>
      </div>
    </ThemeProvider>
  );
}

export default App;
