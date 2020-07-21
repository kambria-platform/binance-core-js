var Engine = require('./engine');
var { crypto } = require('@binance-chain/javascript-sdk');
var util = require('../util');

const error = require('../constant/error');

class HybridWallet {
  /**
   * @constructor
   * @param {*} net - Network id
   * @param {*} accOpts - accOpts = {
   *   signTransaction: (function) ...
   *   getAddress: (function) ...
   * }
   */
  constructor(net) {
    this.network = util.getNetworkId(net, 'number');
  }

  /**
   * @func opts
   * Define optional functions for engine
   */
  opts = () => {
    return {
      getAccounts: (callback) => {
        return this.getAddress((er, addr) => {
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
            return this.signTransaction(signBytes, (er, data) => {
              if (er) return reject(er);
              const unencodedPublicKey = crypto.getPublicKey(data.publicKey);
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
    let ok = this.setAccount(accOpts);
    if (!ok) return callback(error.CANNOT_SET_ACCOUNT, null);
    let engine = new Engine(this.network, this.opts());
    engine.client.initChain().then(() => {
      return callback(null, engine.client);
    }).catch(er => {
      return callback(er, null);
    });
  }

  /**
   * @func setAccount
   * Set up coinbase
   * @param {*} getAddress 
   * @param {*} signTransaction 
   */
  setAccount = (accOpts) => {
    let { getAddress, approveTransaction, signTransaction, killSession } = accOpts;
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
    if (!killSession || typeof killSession !== 'function') {
      console.error('killSession must be a function');
      return false;
    }

    this.getAddress = getAddress;
    this.approveTransaction = approveTransaction;
    this.signTransaction = signTransaction;
    this.killSession = killSession;
    return true;
  }
}

module.exports = HybridWallet;