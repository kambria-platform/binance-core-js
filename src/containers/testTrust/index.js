import React, { Component } from 'react';
import WalletConnectQRCodeModal from "@walletconnect/qrcode-modal";
import { Trust } from 'binance-core-js';
import Confirm from '../core/confirm';
import configs from '../../config';
import Helper from '../../helpers';

const DEFAULT_STATE = {
  visible: false,
  network: null,
  account: null,
  balance: null,
  txId: null,
}

class TestTrust extends Component {
  constructor() {
    super();
    this.state = { ...DEFAULT_STATE };
    this.options = {
      getAuthentication: this.getAuthentication,
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

  getAuthentication = {
    open: (code, callback) => {
      WalletConnectQRCodeModal.open(code, () => {
        return callback('User denied to connect', null);
      });
    },
    close: () => {
      WalletConnectQRCodeModal.close();
    }
  }

  connectByTrustWallet = () => {
    this.trust = new Trust(configs.params.network, this.options);
    this.trust.setAccountByTrustWallet((er, re) => {
      if (er) return console.error(er);
      this.watcher = this.trust.watch((er, re) => {
        if (er) return console.error(er);
        this.setState(re);
      });
    });
  }

  sendTx = () => {
    if (this.trust) this.trust.client.transfer(
      this.state.account,
      this.state.account,
      configs.params.amount, 'BNB'
    ).then(re => {
      this.setState({ txId: re.result[0].hash });
    }).catch(er => {
      console.error(er);
      this.setState({ txId: null });
    });
  }

  logout = () => {
    if (this.trust) this.trust.logout();
  }

  componentWillUnmount() {
    if (this.watcher) this.watcher.stopWatching();
  }

  render() {
    return (
      <div>
        <h1>Trust Wallet Test</h1>
        <button onClick={this.connectByTrustWallet}>Connect by Trust Wallet</button>
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
      </div>
    );
  }
}

export default TestTrust;