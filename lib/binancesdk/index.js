var WalletInterface = require('../interface/walletInterface');
var Provider = require('../provider');
var Privatekey = require('./privatekey');
var Mnemonic = require('./mnemonic');
var Keystore = require('./keystore');


class BinanceSDK extends WalletInterface {
  constructor(net, options) {
    super(net, 'softwallet');

    let { getPassphrase, getApproval } = options;
    if (!getPassphrase || !getApproval) throw new Error('Invalid options');
    this.getPassphrase = getPassphrase;
    this.getApproval = getApproval;
  }

  /**
   * @func _setWallet
   * Set up acc to storage that can be used as a wallet
   * @param {*} accOpts 
   */
  _setWallet = (accOpts, callback) => {
    this.provider = new Provider.SoftWallet(this.net);
    accOpts.getPassphrase = this.getPassphrase;
    accOpts.approveTransaction = this.getApproval;
    this.provider.init(accOpts, (er, client) => {
      if (er) return callback(er, null);
      this.client = client;
      return callback(null, client);
    });
  }

  /**
   * PRIVATE KEY
   */

  /**
   * @func setAccountByPrivatekey
   * Set account by private key. (Do not recommend to use)
   * This function is using private key in direct. Eventhought it was secured by 
   * some cryptographical functions, but we strongly recommend to avoid using it in the
   * production environment.
   * @param {*} privatekey 
   */
  setAccountByPrivatekey = (privatekey, callback) => {
    console.warn(`ATTENTION:
    This function is using private key in direct.
    Eventhought it was secured by some cryptographical functions,
    but we strongly recommend to avoid using it in the production environment.`);
    let account = Privatekey.privatekeyToAccount(privatekey, this.pre);
    if (!account) return callback('Invalid private key', null);
    this._setWallet(account, callback);
  }

  /**
   * @func getAccountByPrivatekey
   * Get account by private key. (Do not recommend to use)
   * @param {*} privatekey
   * @param {*} callback 
   */
  getAccountByPrivatekey = (privatekey, callback) => {
    console.warn(`ATTENTION:
    This function is using private key in direct.
    Eventhought it was secured by some cryptographical functions,
    but we strongly recommend to avoid using it in the production environment.`);
    let account = Privatekey.privatekeyToAccount(privatekey, this.pre);
    if (!account) return callback('Invalid private key', null);
    return callback(null, account.address);
  }


  /**
   * MNEMONIC / HDKEY
   */

  /**
   * @func setAccountByMnemonic
   * Set account by mnemonic (bip39) following hdkey (bip44)
   * @param {*} mnemonic - 12 words
   * @param {*} index - index of account
   */
  setAccountByMnemonic = (mnemonic, index, callback) => {
    let account = Mnemonic.mnemonicToAccount(mnemonic, index, this.pre);
    if (!account) return callback('Cannot derive account from mnemonic', null);
    this._setWallet(account, callback);
  }

  /**
   * @func getAccountsByMnemonic
   * Get list of accounts by mnemonic
   * @param {*} mnemonic - 12 words 
   * @param {*} limit - the number of record per page
   * @param {*} page - index of page
   */
  getAccountsByMnemonic = (mnemonic, limit, page, callback) => {
    let list = [];
    for (let i = page * limit; i < page * limit + limit; i++) {
      let account = Mnemonic.mnemonicToAccount(mnemonic, i, this.pre);
      if (!account) return callback('Cannot derive account from mnemonic', null);
      list.push(account.address);
    }
    return callback(null, list);
  }


  /**
   * KEYSTORE
   */

  /**
   * @func setAccountByKeystore
   * Set account by keystore file
   * @param {*} input - input object
   * @param {*} password - password
   */
  setAccountByKeystore = (input, password, callback) => {
    let account = Keystore.keystoreToAccount(input, password, this.pre);
    if (!account) return callback('Cannot decrypt keystore', null);
    this._setWallet(account, callback);
  }

  /**
   * @func getAccountByKeystore
   * Get account by keystore file
   * @param {*} input - input object
   * @param {*} password - password
   * @param {*} callback 
   */
  getAccountByKeystore = (input, password, callback) => {
    let account = Keystore.keystoreToAccount(input, password, this.pre);
    if (!account) return callback('Cannot decrypt keystore', null);
    return callback(null, account.address);
  }
}

module.exports = BinanceSDK;