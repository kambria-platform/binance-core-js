import React, { Component } from 'react';
import { BinanceSDK } from 'binance-core-js';

const MNEMONIC = 'family exact strategy quote about step magic steel afraid cage remain vintage';

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

  connectByMnemonic = () => {
    this.binanceSDK = new BinanceSDK(4, 'softwallet', true);
    this.binanceSDK.setAccountByMnemonic(
      MNEMONIC,
      null,
      "m/44'/714'/0'/0",
      1,
      cb => cb(null, 'dummy passphrase'),
      (er, client) => {
        if (er) return console.error(er);
        console.log(client)
        this.watcher = this.binanceSDK.watch((er, re) => {
          if (er) return console.error(er);
          this.setState(re);
        });
      });
  }

  sendTx = () => {
    if (this.watcher) this.watcher.stopWatching();
  }

  logout = () => {
    if (this.binanceSDK) this.binanceSDK.logout();
  }


  render() {
    return (
      <div>
        <h1>Isoxys Test</h1>
        <button onClick={this.connectByMnemonic}>Connect by Mnemonic</button>
        <button onClick={this.sendTx}>Send</button>
        <button onClick={this.logout}>Logout</button>
        <p>Network: {this.state.network}</p>
        <p>Account: {this.state.account}</p>
        <p>Balance: {this.state.balance}</p>
      </div>
    );
  }
}

export default TestBinanceSDK;