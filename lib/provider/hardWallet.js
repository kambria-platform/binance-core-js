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
        return this.getAddress(this.dpath, (er, addr) => {
          if (er) return callback(er, null);
          if (!addr) return callback(null, []);
          return callback(null, [addr.toLowerCase()]);
        })
      },
      signTransaction: (accParams, txParams) => {
        return new Promise((resolve, reject) => {
          return this.approveTransaction(txParams, (er, approved) => {
            if (er || !approved) return reject(error.USER_DENIED_TX);
            const signBytes = accParams.getSignBytes(txParams);
            this.waitTransaction.open();
            return this.signTransaction(this.dpath, signBytes, (er, data) => {
              this.waitTransaction.close();
              if (er) return reject(er);
              const unencodedPublicKey = BnbCrypto.getPublicKey(data.publicKey);
              const signedTx = accParams.addSignature(unencodedPublicKey, data.signature);
              return resolve(signedTx);
            });
          });
        });
      },
      killSession: () => {
        return this.killSession();
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
    const ok = this.setAccount(accOpts);
    if (!ok) return callback(error.CANNOT_SET_ACCOUNT, null);
    this.dpath = util.addDPath(accOpts.path, accOpts.index);
    const engine = new Engine(this.network, this.opts());
    return engine.client.initChain().then(() => {
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
  setAccount = (accOpts) => {
    const { getAddress, approveTransaction, waitTransaction, signTransaction, killSession } = accOpts;
    if (!getAddress || typeof getAddress !== 'function') {
      console.error('getAddress must be a function');
      return false;
    }
    if (!approveTransaction || typeof approveTransaction !== 'function') {
      console.error('approveTransaction must be a function');
      return false;
    }
    if (!signTransaction || typeof signTransaction !== 'function') {
      console.error('signTransaction must be a function');
      return false;
    }
    if (!waitTransaction || typeof waitTransaction.open !== 'function' || typeof waitTransaction.close !== 'function') {
      console.error('waitTransaction must be a object of open function and close function');
      return false;
    }
    if (!killSession || typeof killSession !== 'function') {
      console.error('killSession must be a function');
      return false;
    }

    this.getAddress = getAddress;
    this.approveTransaction = approveTransaction;
    this.waitTransaction = waitTransaction;
    this.signTransaction = signTransaction;
    this.killSession = killSession;
    return true;
  }
}

module.exports = HardWallet;