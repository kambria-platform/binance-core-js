var WalletInterface = require('../interface/walletInterface');
var { cache } = require('../storage');
var eachOfSeries = require('async/eachOfSeries');
var util = require('../util');
var Provider = require('../provider');
var LedgerNanoS = require('./ledgerNanoS');


class Ledger extends WalletInterface {
  constructor(net, options) {
    super(net, 'hardwallet');

    const { getWaiting, getApproval } = options;
    if (!getWaiting || !getApproval) throw new Error('Invalid options');
    this.getWaiting = getWaiting;
    this.getApproval = getApproval;
  }

  /**
   * @func _setWallet
   * (Internal function) Set up acc to storage that can be used as a wallet
   * @param {*} accOpts 
   */
  _setWallet = (accOpts, callback) => {
    this.provider = new Provider.HardWallet(this.net);
    accOpts.waitTransaction = this.getWaiting;
    accOpts.approveTransaction = this.getApproval;
    return this.provider.init(accOpts, (er, client) => {
      if (er) return callback(er, null);
      this.client = client;
      return callback(null, client);
    });
  }

  /**
   * LEDGER Nano S
   */

  /**
   * @func setAccountByLedgerNanoS
   * Set account by Ledger Nano S
   * @param {*} path - root derivation path (m/44'/714'/0'/0 as default)
   * @param {*} index - (optional)
   */
  setAccountByLedgerNanoS = (path, index, callback) => {
    const getAddress = (dpath, callback) => {
      let child = cache.get('ledgerNanoS-child-' + dpath);
      if (child) return callback(null, JSON.parse(child).address);
      return LedgerNanoS.getPublickeyAndAddress(dpath, this.pre, (er, re) => {
        if (er) return callback(er, null);

        cache.set('ledgerNanoS-child-' + dpath, JSON.stringify(re));
        return callback(null, re.address);
      });
    }
    const signTransaction = (dpath, signBytes, callback) => {
      return LedgerNanoS.signTransaction(dpath, this.pre, signBytes, (er, sig) => {
        if (er) return callback(er, null);

        const child = cache.get('ledgerNanoS-child-' + dpath);
        if (!child) return callback('Cannot unlock account', null);
        const publicKey = JSON.parse(child).publicKey;
        return callback(null, { signature: sig, publicKey })
      });
    }
    const killSession = () => {
      return cache.removeAll();
    }
    const account = {
      getAddress: getAddress,
      signTransaction: signTransaction,
      killSession: killSession,
      path: path,
      index: index
    }
    return this._setWallet(account, callback);
  }

  /**
   * @func getAccountsByLedgerNanoS
   * Get list of accounts by Ledger Nano S
   * @param {*} path - root derivation path (m/44'/714'/0'/0 as default)
   * @param {*} limit 
   * @param {*} page 
   */
  getAccountsByLedgerNanoS = (path, limit, page, callback) => {
    let indice = [];
    let result = [];
    for (let i = page; i < limit * (page + 1); i++) indice.push(i);
    return eachOfSeries(indice, (index, key, cb) => {
      const dpath = util.addDPath(path, index);
      const child = cache.get('ledgerNanoS-child-' + dpath);
      if (child) {
        result[key] = JSON.parse(child).address;
        return cb();
      }
      return LedgerNanoS.getPublickeyAndAddress(dpath, this.pre, (er, re) => {
        if (er) return cb(er);
        result[key] = re.address;
        cache.set('ledgerNanoS-child-' + dpath, JSON.stringify(re));
        return cb();
      });
    }, (er) => {
      if (er) return callback(er, null);
      return callback(null, result);
    });
  }
}

module.exports = Ledger;