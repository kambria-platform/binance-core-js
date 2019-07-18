var Engine = require('./engine');
var BnbCrypto = require('@binance-chain/javascript-sdk').crypto;
var util = require('../util');

const error = require('../constant/error');

class HardWallet {
  /**
   * @constructor
   * @param {*} net - Network id
   * @param {*} accOpts - accOpts = {
   *   signTransaction: (function) ...
   *   getAddress: (function) ...
   *   path: (string) ...
   *   index: (optional) ...
   * }
   */
  constructor(net) {
    this.network = util.getNetworkId(net, 'string');
    this.prefix = util.getBnbPrefix(net);
  }

  /**
   * @func opts
   * Define optional functions for engine
   */
  opts = () => {
    return {
      getAccounts: (callback) => {
        this.getAddress(this.dpath, (er, addr) => {
          if (er) return callback(er, null);
          if (!addr) return callback(null, []);
          return callback(null, [addr.toLowerCase()]);
        })
      },
      signTransaction: (accParams, txParams) => {
        return new Promise((resolve, reject) => {
          let signBytes = accParams.getSignBytes(txParams);
          this.signTransaction(this.dpath, signBytes, (er, data) => {
            if (er) return reject(er);
            let unencodedPublicKey = BnbCrypto.getPublicKey(data.publicKey);
            let signedTx = accParams.addSignature(unencodedPublicKey, data.signature);
            return resolve(signedTx);
          });
        });
      }
    }
  }

  /**
   * @func init
   * Initialize client 
   * @param {*} accOpts 
   * @param {*} callback 
   */
  init = (accOpts, callback) => {
    accOpts = accOpts || {};
    let engine = new Engine(this.network, this.opts());
    this.dpath = util.addDPath(accOpts.path, accOpts.index);
    let ok = this.setAccount(accOpts.getAddress, accOpts.signTransaction);
    if (!ok) return callback(error.CANNOT_SET_ACCOUNT, null);
    // We used callback to fomalize code interface with other classes
    engine.client.initChain().then(() => {
      return callback(null, engine.client);
    }).catch(er => {
      return callback(er, null);
    });
  }

  /**
   * @func setAccount
   * Set up coinbase
   * @param {*} address 
   */
  setAccount = (getAddress, signTransaction) => {
    if (!getAddress || typeof getAddress !== 'function') {
      console.error('getAddress must be a function');
      return false;
    }
    if (!signTransaction || typeof signTransaction !== 'function') {
      console.error('signTransaction must be a function');
      return false;
    }

    this.getAddress = getAddress;
    this.signTransaction = signTransaction;
    return true;
  }
}

module.exports = HardWallet;