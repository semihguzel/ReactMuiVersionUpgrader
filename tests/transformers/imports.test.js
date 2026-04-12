import { describe, it, expect } from '@jest/globals';
import { transformPackageRenames } from '../../src/transformers/imports/packageRename.js';
import { transformLabToCore } from '../../src/transformers/imports/labToCore.js';
import { transformColorImports } from '../../src/transformers/imports/colorImports.js';

describe('packageRename transformer', () => {
  it('should rename @material-ui/core to @mui/material', () => {
    const input = `import { Button } from '@material-ui/core';`;
    const result = transformPackageRenames(input, 'test.jsx');
    expect(result.changed).toBe(true);
    expect(result.source).toBe(`import { Button } from '@mui/material';`);
  });

  it('should rename deep imports', () => {
    const input = `import Button from '@material-ui/core/Button';`;
    const result = transformPackageRenames(input, 'test.jsx');
    expect(result.changed).toBe(true);
    expect(result.source).toBe(`import Button from '@mui/material/Button';`);
  });

  it('should rename @material-ui/icons', () => {
    const input = `import SaveIcon from '@material-ui/icons/Save';`;
    const result = transformPackageRenames(input, 'test.jsx');
    expect(result.changed).toBe(true);
    expect(result.source).toBe(`import SaveIcon from '@mui/icons-material/Save';`);
  });

  it('should rename @material-ui/lab', () => {
    const input = `import { Alert } from '@material-ui/lab';`;
    const result = transformPackageRenames(input, 'test.jsx');
    expect(result.changed).toBe(true);
    expect(result.source).toBe(`import { Alert } from '@mui/lab';`);
  });

  it('should rename @material-ui/styles', () => {
    const input = `import { makeStyles } from '@material-ui/styles';`;
    const result = transformPackageRenames(input, 'test.jsx');
    expect(result.changed).toBe(true);
    expect(result.source).toBe(`import { makeStyles } from '@mui/styles';`);
  });

  it('should rename styles deep import', () => {
    const input = `import { createMuiTheme } from '@material-ui/core/styles';`;
    const result = transformPackageRenames(input, 'test.jsx');
    expect(result.changed).toBe(true);
    expect(result.source).toBe(`import { createMuiTheme } from '@mui/material/styles';`);
  });

  it('should handle double quotes', () => {
    const input = `import { Button } from "@material-ui/core";`;
    const result = transformPackageRenames(input, 'test.jsx');
    expect(result.changed).toBe(true);
    expect(result.source).toBe(`import { Button } from "@mui/material";`);
  });

  it('should not change non-MUI imports', () => {
    const input = `import React from 'react';`;
    const result = transformPackageRenames(input, 'test.jsx');
    expect(result.changed).toBe(false);
  });

  it('should handle require statements', () => {
    const input = `const { Button } = require('@material-ui/core');`;
    const result = transformPackageRenames(input, 'test.jsx');
    expect(result.changed).toBe(true);
    expect(result.source).toBe(`const { Button } = require('@mui/material');`);
  });
});

describe('labToCore transformer', () => {
  it('should move Alert from lab to material', () => {
    const input = `import { Alert } from '@mui/lab';`;
    const result = transformLabToCore(input, 'test.jsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain(`from '@mui/material'`);
  });

  it('should split mixed lab imports', () => {
    const input = `import { Alert, TabPanel } from '@mui/lab';`;
    const result = transformLabToCore(input, 'test.jsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain(`import { Alert } from '@mui/material';`);
    expect(result.source).toContain(`import { TabPanel } from '@mui/lab';`);
  });

  it('should handle deep lab import', () => {
    const input = `import Alert from '@mui/lab/Alert';`;
    const result = transformLabToCore(input, 'test.jsx');
    expect(result.changed).toBe(true);
    expect(result.source).toBe(`import Alert from '@mui/material/Alert';`);
  });

  it('should move Skeleton from lab to material', () => {
    const input = `import { Skeleton } from '@material-ui/lab';`;
    const result = transformLabToCore(input, 'test.jsx');
    expect(result.changed).toBe(true);
    expect(result.source).toContain(`'@mui/material'`);
  });
});

describe('colorImports transformer', () => {
  it('should fix nested color import', () => {
    const input = `import red from '@mui/material/colors/red';`;
    const result = transformColorImports(input, 'test.jsx');
    expect(result.changed).toBe(true);
    expect(result.source).toBe(`import { red } from '@mui/material/colors';`);
  });

  it('should handle aliased color import', () => {
    const input = `import myRed from '@mui/material/colors/red';`;
    const result = transformColorImports(input, 'test.jsx');
    expect(result.changed).toBe(true);
    expect(result.source).toBe(`import { red as myRed } from '@mui/material/colors';`);
  });

  it('should fix old path color import', () => {
    const input = `import blue from '@material-ui/core/colors/blue';`;
    const result = transformColorImports(input, 'test.jsx');
    expect(result.changed).toBe(true);
    expect(result.source).toBe(`import { blue } from '@mui/material/colors';`);
  });
});
