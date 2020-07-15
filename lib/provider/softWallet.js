var BnbCrypto = require('@binance-chain/javascript-sdk').crypto;
var cryptoJS = {
  AES: require('crypto-js/aes'),
  PBKDF2: require('crypto-js/pbkdf2'),
  enc: { Utf8: require('crypto-js/enc-utf8') },
  lib: { WordArray: require('crypto-js/lib-typedarrays') }
}
var Engine = require('./engine');
var { sessionStorage } = require('../storage');
var util = require('../util');

const error = require('../constant/error');

class SoftWallet {
  /**
   * @constructor
   * @param {*} net - Network id
   * @param {*} accOpts - accOpts = {
   *   address: ...
   *   privateKey: ...
   *   getPassphrase: ...
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
        const accounts = this.getAddress();
        return callback(null, accounts);
      },
      signTransaction: (accParams, txParams) => {
        return new Promise((resolve, reject) => {
          return this.approveTransaction(txParams, (er, approved) => {
            if (er || !approved) return reject(error.USER_DENIED_TX);
            return this.getPassphrase((er, passphrase) => {
              if (er || !passphrase) return reject(error.CANNOT_UNLOCK_ACCOUNT);
              const priv = this.unlockAccount(passphrase);
              if (!priv) return reject(error.CANNOT_UNLOCK_ACCOUNT);
              const signedTx = accParams.sign(priv, txParams);
              return resolve(signedTx);
            });
          });
        });
      },
      killSession: () => {
        return sessionStorage.remove();
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
    const engine = new Engine(this.network, this.opts());
    return this.setAccount(accOpts, (er, re) => {
      if (er || !re) return callback(error.CANNOT_SET_ACCOUNT, null);
      return engine.client.initChain().then(() => {
        return callback(null, engine.client);
      }).catch(er => {
        return callback(er, null);
      });
    });
  }

  /**
   * @func setAccount
   * Set up coinbase (internal function)
   * @param {string} address 
   * @param {string} privateKey 
   * @param {function} passphrase 
   */
  setAccount = (accOpts, callback) => {
    let { address, privateKey, getPassphrase, approveTransaction } = accOpts;
    if (!getPassphrase || typeof getPassphrase !== 'function') return callback('getPassphrase must be not a function', null);
    if (!approveTransaction || typeof approveTransaction !== 'function') return callback('approveTransaction must be a function', null);

    this.getPassphrase = getPassphrase;
    this.approveTransaction = approveTransaction;

    if (!address || !privateKey) return callback(null, true);
    if (!this.validatePrivateKey(address, privateKey)) return callback('Invalid address or private key', null);

    address = address.toLowerCase();
    privateKey = privateKey.toLowerCase();
    return this.getPassphrase((er, passphrase) => {
      if (er) return callback(er, null);
      if (!passphrase) return callback(er, 'User denied unlocking account');

      passphrase = passphrase.toString();
      const salt = cryptoJS.lib.WordArray.random(128 / 8);
      const password = this.constructPassword(passphrase, salt);
      if (!password) return callback('Cannot set up password', null);

      const encryptedPriv = cryptoJS.AES.encrypt(privateKey, password).toString();
      const acc = {
        ADDRESS: address,
        ENCRYPTED_PRIVATEKEY: encryptedPriv,
        SALT: salt
      };

      sessionStorage.set(acc);
      return callback(null, acc);
    });
  }

  /**
   * @func validatePrivateKey
   * Double check the pair of address/privatekey
   * @param {*} addr 
   * @param {*} priv 
   */
  validatePrivateKey = (addr, priv) => {
    if (!addr || !priv) return false;
    let valid = true;
    let _addr = null;
    try { _addr = BnbCrypto.getAddressFromPrivateKey(priv, this.prefix); }
    catch (er) { if (er) return false; }
    if (!_addr) return false;
    valid = valid && (_addr === addr);
    return valid;
  }

  /**
   * @func constructPassword
   * Construct password from passphrase and salt
   * @param {*} passphrase 
   * @param {*} salt 
   */
  constructPassword = (passphrase, salt) => {
    if (!passphrase || !salt) return null;
    let password = cryptoJS.PBKDF2(passphrase, salt, { keySize: 512 / 32, iterations: 1000 });
    return password.toString();
  }

  /**
   * @func unlockAccount
   * Internal function, that acctually does unlocking acc.
   * @param {*} passphrase 
   */
  unlockAccount = (passphrase) => {
    try {
      let password = this.constructPassword(passphrase, this.getSalt());
      let enpriv = this.getEncryptedPrivateKey();
      if (!password || !enpriv) return null;
      let priv = cryptoJS.AES.decrypt(enpriv, password);
      if (!priv) return null;
      priv = priv.toString(cryptoJS.enc.Utf8);
      return priv;
    } catch (er) { return null; } // Try catch unexpected Error
  }

  /**
   * Functions for reading sessionStorage
   */
  getAddress = () => {
    const acc = sessionStorage.get();
    if (!acc || typeof acc !== 'object') return [];
    return [acc.ADDRESS];
  }
  getEncryptedPrivateKey = () => { // the encrypted form of private key
    const acc = sessionStorage.get();
    if (!acc || typeof acc !== 'object') return null;
    return acc.ENCRYPTED_PRIVATEKEY;
  }
  getSalt = () => {
    const acc = sessionStorage.get();
    if (!acc || typeof acc !== 'object') return null;
    return acc.SALT;
  }
}

module.exports = SoftWallet;