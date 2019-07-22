import React, { Component } from 'react';
import { Ledger } from 'binance-core-js';
import configs from '../../config';
import Helper from '../../helpers';

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

  connectByLedgerNanoS = () => {
    this.ledger = new Ledger(configs.params.network, 'softwallet', true);
    this.ledger.setAccountByLedgerNanoS(
      "m/44'/714'/0'/0",
      0,
      (er, re) => {
        if (er) return console.error(er);
        this.watcher = this.ledger.watch((er, re) => {
          if (er) return console.error(er);
          this.setState(re);
        });
      });
  }

  sendTx = () => {
    if (this.ledger) this.ledger.client.transfer(
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
    if (this.ledger) this.ledger.logout();
  }

  componentWillUnmount() {
    if (this.watcher) this.watcher.stopWatching();
  }

  render() {
    return (
      <div>
        <h1>Ledger Test</h1>
        <button onClick={this.connectByLedgerNanoS}>Connect by Ledger Nano S</button>
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