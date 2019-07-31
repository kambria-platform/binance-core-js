import React, { Component } from 'react';
import { BinanceSDK } from 'binance-core-js';
import Confirm from '../core/confirm';
import configs from '../../config';
import Helper from '../../helpers';


const PRIVATE_KEY = '485647f8e0cdbe18865495847e0d0bd8a25b687804344aefb266e2bd369d4d27';
const MNEMONIC = 'page term erupt print mystery sell cup purse arrow term corn couch inquiry parrot curtain clown owner daughter opera bleak february oven chat saddle';
const KEYSTORE = require('./5f80e75e-d947-4971-b2dc-45cd6b63c725_keystore.json');

const DEFAULT_STATE = {
  visible: false,
  network: null,
  account: null,
  balance: null,
  txId: null,
}

class TestBinanceSDK extends Component {
  constructor() {
    super();
    this.state = { ...DEFAULT_STATE };
    this.options = {
      getPassphrase: this.getPassphrase,
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

  getPassphrase = (callback) => {
    return callback(null, 'dummy passphrase');
  }

  connectByPrivatekey = () => {
    this.binanceSDK = new BinanceSDK(configs.params.network, this.options);
    this.binanceSDK.setAccountByPrivatekey(
      PRIVATE_KEY,
      (er, client) => {
        if (er) return console.error(er);
        this.watcher = this.binanceSDK.watch((er, re) => {
          if (er) return console.error(er);
          this.setState(re);
        });
      });
  }

  connectByMnemonic = () => {
    this.binanceSDK = new BinanceSDK(configs.params.network, this.options);
    this.binanceSDK.setAccountByMnemonic(
      MNEMONIC,
      0,
      (er, client) => {
        if (er) return console.error(er);
        this.watcher = this.binanceSDK.watch((er, re) => {
          if (er) return console.error(er);
          this.setState(re);
        });
      });
  }

  connectByKeystore = () => {
    this.binanceSDK = new BinanceSDK(configs.params.network, this.options);
    this.binanceSDK.setAccountByKeystore(
      KEYSTORE,
      'ASDqwe12#',
      (er, client) => {
        if (er) return console.error(er);
        this.watcher = this.binanceSDK.watch((er, re) => {
          if (er) return console.error(er);
          this.setState(re);
        });
      });
  }

  sendTx = () => {
    if (this.binanceSDK) this.binanceSDK.client.transfer(
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
    if (this.binanceSDK) this.binanceSDK.logout();
  }

  componentWillUnmount() {
    if (this.watcher) this.watcher.stopWatching();
  }

  render() {
    return (
      <div>
        <h1>BinanceSDK Test</h1>
        <button onClick={this.connectByPrivatekey}>Connect by Privatekey</button>
        <button onClick={this.connectByMnemonic}>Connect by Mnemonic</button>
        <button onClick={this.connectByKeystore}>Connect by Keystore</button>
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

export default TestBinanceSDK;