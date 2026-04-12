/**
 * v7-sample/src/App.tsx
 *
 * Sample MUI v7 codebase that exercises all v7→v8/v9 transformers.
 * After migration this file should have all the changes applied.
 */

// licenseInfo transformer: LicenseInfo should move to @mui/x-license
import { LicenseInfo } from '@mui/x-data-grid-pro';

// Standard MUI v7 imports
import React from 'react';
import { Button, Grid, Typography, Menu } from '@mui/material';
import { DataGrid, useGridApiEventHandler, useGridApiOptionHandler } from '@mui/x-data-grid';
import { selectedGridRowsSelector, selectedGridRowsCountSelector, GridListColDef } from '@mui/x-data-grid';
import { treeViewClasses } from '@mui/x-tree-view';

// iconRenames transformer: InfoOutline → InfoOutlined, HomeOutline → HomeOutlined
import InfoOutline from '@mui/icons-material/InfoOutline';
import HomeOutline from '@mui/icons-material/HomeOutline';

LicenseInfo.setLicenseKey('YOUR_LICENSE_KEY');

// componentsPropsToSlotProps transformer
function AutocompleteExample() {
  return (
    <Autocomplete
      componentsProps={{ paper: { elevation: 8 } }}
      InputComponent={CustomInput}
      InputProps={{ className: 'my-input' }}
    />
  );
}

// gridSizeProps transformer: xs/sm/md/lg/xl → size prop
function LayoutExample() {
  return (
    <Grid container spacing={2}>
      <Grid xs={12} sm={6} md={4}>
        <Typography>Full → half → third</Typography>
      </Grid>
      <Grid xs={12} md={8}>
        <Typography>Full → two-thirds</Typography>
      </Grid>
      <Grid xs>
        <Typography>Auto-grow</Typography>
      </Grid>
    </Grid>
  );
}

// unstableFeatures transformer: unstable_* → stable
function DataGridExample({ apiRef }: { apiRef: any }) {
  // These props should be renamed to stable names
  return (
    <DataGrid
      unstable_rowSpanning
      unstable_dataSource={myDataSource}
      unstable_dataSourceCache={myCache}
      unstable_lazyLoading
      unstable_listView
    />
  );
}

// hookRenames transformer: useGridApiEventHandler → useGridEvent
function GridEventExample({ apiRef }: { apiRef: any }) {
  useGridApiEventHandler(apiRef, 'rowClick', (params) => {
    console.log(params);
  });

  useGridApiOptionHandler(apiRef, 'rowClick', (params) => {
    console.log(params);
  });

  return null;
}

// selectorRenames transformer
function SelectionExample({ apiRef }: { apiRef: any }) {
  const selectedRows = selectedGridRowsSelector(apiRef);
  const count = selectedGridRowsCountSelector(apiRef);
  const colDef: GridListColDef = { field: 'name' };
  const classes = treeViewClasses;

  return <div>{count} rows selected</div>;
}

// removedApis transformer (warn-only — these should NOT be auto-fixed)
function RemovedApisExample() {
  return (
    <DataGrid
      indeterminateCheckboxAction="select"
      rowPositionsDebounceMs={100}
      resetPageOnSortFilter
      rowSelectionModel={[1, 2, 3]}
    />
  );
}

// Charts legend prop (warn-only)
function ChartExample() {
  return (
    <BarChart
      legend={{ position: 'top' }}
    />
  );
}

// MuiTreeView theme key (selectorRenames transformer)
const theme = createTheme({
  components: {
    MuiTreeView: {
      styleOverrides: {
        root: { fontSize: 14 },
      },
    },
  },
});

export default function App() {
  return (
    <div>
      <InfoOutline />
      <HomeOutline />
      <LayoutExample />
      <DataGridExample apiRef={null} />
      <GridEventExample apiRef={null} />
      <SelectionExample apiRef={null} />
      <RemovedApisExample />
      <ChartExample />
    </div>
  );
}
