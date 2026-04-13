import { describe, it, expect } from '@jest/globals';
import { transformPackageRenames } from '../../src/transformers/imports/packageRename.js';
import { transformLabToCore } from '../../src/transformers/imports/labToCore.js';
import { transformColorImports } from '../../src/transformers/imports/colorImports.js';
import { transformThirdPartyRenames } from '../../src/transformers/imports/thirdPartyRenames.js';

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

  it('should fix colorManipulator deep import path from v4 (leave fade for fadeToAlpha)', () => {
    const input = `import { fade, lighten, darken } from '@material-ui/core/styles/colorManipulator';`;
    const result = transformColorImports(input, 'test.jsx');
    expect(result.changed).toBe(true);
    // Path is fixed; `fade` symbol stays so fadeToAlpha can rename it + all call sites
    expect(result.source).toBe(`import { fade, lighten, darken } from '@mui/material/styles';`);
  });

  it('should fix colorManipulator path already at @mui (packageRename already ran)', () => {
    const input = `import { fade, emphasize } from '@mui/material/styles/colorManipulator';`;
    const result = transformColorImports(input, 'test.jsx');
    expect(result.changed).toBe(true);
    expect(result.source).toBe(`import { fade, emphasize } from '@mui/material/styles';`);
  });

  it('should fix colorManipulator path when fade is not present', () => {
    const input = `import { lighten, darken, getContrastRatio } from '@material-ui/core/styles/colorManipulator';`;
    const result = transformColorImports(input, 'test.jsx');
    expect(result.changed).toBe(true);
    expect(result.source).toBe(`import { lighten, darken, getContrastRatio } from '@mui/material/styles';`);
  });
});

describe('thirdPartyRenames transformer', () => {
  it('should rename formik-material-ui imports to formik-mui', () => {
    const input = `import { fieldToTextField } from 'formik-material-ui';`;
    const result = transformThirdPartyRenames(input, 'test.jsx');
    expect(result.changed).toBe(true);
    expect(result.source).toBe(`import { fieldToTextField } from 'formik-mui';`);
  });

  it('should rename multiple formik-material-ui imports', () => {
    const input = [
      `import { fieldToTextField } from 'formik-material-ui';`,
      `import { CheckboxWithLabel } from 'formik-material-ui';`,
      `import { Switch } from 'formik-material-ui';`,
    ].join('\n');
    const result = transformThirdPartyRenames(input, 'test.jsx');
    expect(result.changed).toBe(true);
    expect(result.source).not.toContain('formik-material-ui');
    expect(result.source.match(/formik-mui/g)).toHaveLength(3);
  });

  it('should rename material-table to @material-table/core', () => {
    const input = `import MaterialTable from 'material-table';`;
    const result = transformThirdPartyRenames(input, 'test.jsx');
    expect(result.changed).toBe(true);
    expect(result.source).toBe(`import MaterialTable from '@material-table/core';`);
  });

  it('should convert material-ui-chip-input default import to named with alias', () => {
    const input = `import ChipInput from 'material-ui-chip-input';`;
    const result = transformThirdPartyRenames(input, 'test.jsx');
    expect(result.changed).toBe(true);
    // Default export → named export; local alias preserved so JSX needs no changes
    expect(result.source).toBe(`import { MuiChipsInput as ChipInput } from 'mui-chips-input';`);
  });

  it('should drop alias when local name already matches the new export name', () => {
    const input = `import MuiChipsInput from 'material-ui-chip-input';`;
    const result = transformThirdPartyRenames(input, 'test.jsx');
    expect(result.changed).toBe(true);
    expect(result.source).toBe(`import { MuiChipsInput } from 'mui-chips-input';`);
  });

  it('should rename material-ui-image to mui-image', () => {
    const input = `import Image from 'material-ui-image';`;
    const result = transformThirdPartyRenames(input, 'test.jsx');
    expect(result.changed).toBe(true);
    expect(result.source).toBe(`import Image from 'mui-image';`);
  });

  it('should not change packages that only need a version bump (no replacedBy)', () => {
    const input = `import { useConfirm } from 'material-ui-confirm';`;
    const result = transformThirdPartyRenames(input, 'test.jsx');
    expect(result.changed).toBe(false);
  });

  it('should not change unrelated imports', () => {
    const input = `import React from 'react';`;
    const result = transformThirdPartyRenames(input, 'test.jsx');
    expect(result.changed).toBe(false);
  });
});
