var BnbClient = require('@binance-chain/javascript-sdk');

var { getRPC, getNetwork } = require('../rpc');

const _defaut = require('./defaultFunc');
const error = require('../../constant/error');

class Engine {
  /**
   * 
   * @param {*} net - network ID or net work name
   * @param {*} opts - getAccounts: return coinbase
   *                   signTransaction: sign raw tx
   */
  constructor(net, opts) {
    const rpc = getRPC(net);
    const network = getNetwork(net);
    if (!rpc || !network) throw new Error(error.CANNOT_CONNECT_RPC);
    if (!opts) opts = {};

    this.RPC = rpc;
    this.getAccounts = (!opts.getAccounts || typeof opts.getAccounts !== 'function') ? _defaut.getAccounts : opts.getAccounts;
    this.signTransaction = (!opts.signTransaction || typeof opts.signTransaction !== 'function') ? _defaut.signTransaction : opts.signTransaction;

    this.client = new BnbClient(rpc);
    this.client.chooseNetwork(network);
    this.client.setSigningDelegate(this.signTransaction);
    this.client.getAccounts = this.getAccounts;

  }
}

module.exports = Engine;