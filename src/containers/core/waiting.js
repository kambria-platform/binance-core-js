import React, { Component } from 'react';
import LinearProgress from '@material-ui/core/LinearProgress';
import Grid from '@material-ui/core/Grid';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

class Waiting extends Component {
  render() {
    return <Dialog
      open={this.props.open}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">Waiting for signature</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">Please following the structions on your device.</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <LinearProgress />
          </Grid>
        </Grid>
      </DialogActions>
    </Dialog>
  }
}

export default Waiting;