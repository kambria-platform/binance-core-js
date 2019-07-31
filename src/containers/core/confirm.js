import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

class Confirm extends Component {
  render() {
    return <Dialog
      open={this.props.open}
      onClose={this.props.onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">Confirming transaction</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">{this.props.message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={this.props.onCancel} color="secondary">Cancel</Button>
        <Button onClick={this.props.onApprove} color="primary">Approve</Button>
      </DialogActions>
    </Dialog>
  }
}

export default Confirm;