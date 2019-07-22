import React, { Component } from 'react';
import { BinanceSDK } from 'binance-core-js';
import configs from '../../config';
import Helper from '../../helpers';


const PRIVATE_KEY = '485647f8e0cdbe18865495847e0d0bd8a25b687804344aefb266e2bd369d4d27';
const MNEMONIC = 'page term erupt print mystery sell cup purse arrow term corn couch inquiry parrot curtain clown owner daughter opera bleak february oven chat saddle';
const KEYSTORE = require('./5f80e75e-d947-4971-b2dc-45cd6b63c725_keystore.json');

const DEFAULT_STATE = {
  network: null,
  account: null,
  balance: null,
  txId: null,
}

class TestBinanceSDK extends Component {
  constructor() {
    super();
    this.state = { ...DEFAULT_STATE };
  }

  connectByPrivatekey = () => {
    this.binanceSDK = new BinanceSDK(configs.params.network, 'softwallet', true);
    this.binanceSDK.setAccountByPrivatekey(
      PRIVATE_KEY,
      cb => cb(null, 'dummy passphrase'),
      (er, client) => {
        if (er) return console.error(er);
        this.watcher = this.binanceSDK.watch((er, re) => {
          if (er) return console.error(er);
          this.setState(re);
        });
      });
  }

  connectByMnemonic = () => {
    this.binanceSDK = new BinanceSDK(configs.params.network, 'softwallet', true);
    this.binanceSDK.setAccountByMnemonic(
      MNEMONIC,
      0,
      cb => cb(null, 'dummy passphrase'),
      (er, client) => {
        if (er) return console.error(er);
        this.watcher = this.binanceSDK.watch((er, re) => {
          if (er) return console.error(er);
          this.setState(re);
        });
      });
  }

  connectByKeystore = () => {
    this.binanceSDK = new BinanceSDK(configs.params.network, 'softwallet', true);
    this.binanceSDK.setAccountByKeystore(
      KEYSTORE,
      'ASDqwe12#',
      cb => cb(null, 'dummy passphrase'),
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
      </div>
    );
  }
}

export default TestBinanceSDK;