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
   *                   killSession: clear browser storage, disconnect to servers in case
   */
  constructor(net, opts) {
    const rpc = getRPC(net);
    const network = getNetwork(net);
    if (!rpc || !network) throw new Error(error.CANNOT_CONNECT_RPC);
    if (!opts) opts = {};

    let getAccounts = (!opts.getAccounts || typeof opts.getAccounts !== 'function') ? _defaut.getAccounts : opts.getAccounts;
    let signTransaction = (!opts.signTransaction || typeof opts.signTransaction !== 'function') ? _defaut.signTransaction : opts.signTransaction;
    let killSession = (!opts.killSession || typeof opts.killSession !== 'function') ? _defaut.killSession : opts.killSession;

    this.client = new BnbClient(rpc);
    this.client.chooseNetwork(network);
    this.client.setSigningDelegate(signTransaction);
    this.client.getAccounts = getAccounts;
    this.client.killSession = killSession;
  }
}

module.exports = Engine;