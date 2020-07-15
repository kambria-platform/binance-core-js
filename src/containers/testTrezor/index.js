import React, { Component } from 'react';
import { Trezor } from 'binance-core-js';
import Confirm from '../core/confirm';
import Waiting from '../core/waiting';
import configs from '../../config';
import Helper from '../../helpers';

const DEFAULT_STATE = {
  visible: false,
  waiting: false,
  network: null,
  account: null,
  balance: null,
  txId: null,
}

class TestTrezor extends Component {
  constructor() {
    super();
    this.state = { ...DEFAULT_STATE };
    this.options = {
      getWaiting: this.getWaiting,
      getApproval: this.getApproval
    }
  }

  getApproval = (params, callback) => {
    let from = params.inputs[0].address
    let to = params.outputs[0].address
    let value = params.outputs[0].coins[0].amount / 10 ** 8
    this.setState({
      visible: true,
      message: `From: ${from} / To: ${to} / Value: ${value}`,
      onCancel: () => {
        this.setState({ visible: false }, () => {
          return callback(null, false);
        });
      },
      onApprove: () => {
        this.setState({ visible: false }, () => {
          return callback(null, true);
        });
      }
    });
  }

  getWaiting = {
    open: () => {
      this.setState({ waiting: true });
    },
    close: () => {
      this.setState({ waiting: false });
    }
  }

  connectByTrezorOne = () => {
    this.trezor = new Trezor(configs.params.network, this.options);
    return this.trezor.setAccountByTrezorOne("m/44'/714'/0'/0", 0, (er, re) => {
      if (er) return console.error(er);
      return this.watcher = this.trezor.watch((er, re) => {
        if (er) return console.error(er);
        return this.setState(re);
      });
    });
  }

  sendTx = () => {
    if (this.trezor) return this.trezor.client.transfer(
      this.state.account,
      this.state.account,
      configs.params.amount, 'BNB'
    ).then(re => {
      return this.setState({ txId: re.result[0].hash });
    }).catch(er => {
      console.error(er);
      return this.setState({ txId: null });
    });
  }

  logout = () => {
    if (this.trezor) return this.trezor.logout();
  }

  componentWillUnmount() {
    if (this.watcher) return this.watcher.stopWatching();
  }

  render() {
    return (
      <div>
        <h1>Trezor Test</h1>
        <button onClick={this.connectByTrezorOne}>Connect by Trezor One</button>
        <button onClick={this.sendTx}>Send</button>
        <button onClick={this.logout}>Logout</button>
        <p>Network: {this.state.network}</p>
        <p>Account: {this.state.account}</p>
        <p>Balance: {this.state.balance}</p>
        <p>TxId: {Helper.linkToBinanceExplorer(this.state.txId)}</p>
        <Confirm
          open={this.state.visible}
          message={this.state.message}
          onClose={this.state.onCancel}
          onCancel={this.state.onCancel}
          onApprove={this.state.onApprove}
        />
        <Waiting open={this.state.waiting} />
      </div>
    );
  }
}

export default TestTrezor;