import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  Chip,
  CircularProgress,
  Collapse,
  TablePagination,
  Link,
  Avatar,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

function DialogExample() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  return (
    <div>
      <Avatar variant="circle" src="/avatar.jpg" />
      <Chip variant="default" label="Tag" />
      <CircularProgress variant="static" value={50} />
      <Collapse collapsedHeight={40}>
        <div>Content</div>
      </Collapse>

      <Link href="/about">About</Link>

      <ExpansionPanel>
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
          Panel Title
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          Panel Content
        </ExpansionPanelDetails>
      </ExpansionPanel>

      <Button onClick={() => setOpen(true)}>Open Dialog</Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Title</DialogTitle>
        <DialogContent>Content</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <TablePagination
        component="div"
        count={100}
        page={page}
        onChangePage={(e, p) => setPage(p)}
        rowsPerPage={rowsPerPage}
        onChangeRowsPerPage={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
      />
    </div>
  );
}

export default DialogExample;
