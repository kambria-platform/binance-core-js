var WalletInterface = require('../interface/walletInterface');
var { cache } = require('../storage');
var util = require('../util');
var Provider = require('../provider');
var TrezorOne = require('./trezorOne');

class Trezor extends WalletInterface {
  /**
   * Constructor
   * @param {*} net 
   * @param {*} options - extra options for specific wallets
   * getWaiting
   * getApproval
   */
  constructor(net, options) {
    super(net, 'hardwallet');

    /**
     * Init options
     */
    let { getWaiting, getApproval } = options;
    if (!getWaiting || !getApproval) throw new Error('Invalid options');
    this.getWaiting = getWaiting;
    this.getApproval = getApproval;
  }

  /**
   * @func setWallet
   * (Internal function) Set up coinbase
   * @param {*} accOpts 
   */
  setWallet = (accOpts, callback) => {
    this.provider = new Provider.HardWallet(this.net);
    console.log(this.provider)
    accOpts.waitTransaction = this.getWaiting;
    accOpts.approveTransaction = this.getApproval;
    return this.provider.init(accOpts, (er, client) => {
      if (er) return callback(er, null);
      this.client = client;
      return callback(null, client);
    });
  }

  /**
   * Trezor One
   */

  /**
   * @func setAccountByTrezorOne
   * Set account by Trezor One
   * @param {*} path - root derivation path (m/44'/714'/0'/0 as default)
   * @param {*} index - (optional)
   */
  setAccountByTrezorOne = (path, index, callback) => {
    const getAddress = (dpath, callback) => {
      const loadedAddressFromCache = cache.get('trezorOne-address-' + dpath);
      if (loadedAddressFromCache) return callback(null, loadedAddressFromCache);
      return TrezorOne.getAddress(dpath, (er, address) => {
        if (er) return callback(er, null);

        cache.set('trezorOne-address-' + dpath, address);
        return callback(null, address);
      });
    }
    const killSession = () => {
      return cache.removeAll();
    }
    const account = {
      getAddress: getAddress,
      signTransaction: TrezorOne.signTransaction,
      killSession: killSession,
      path: path,
      index: index
    }
    return this.setWallet(account, callback);
  }

  /**
   * @func getAccountsByTrezorOne
   * Get list of accounts by Trezor One
   * @param {*} path - root derivation path (m/44'/714'/0'/0 as default)
   * @param {*} limit 
   * @param {*} page 
   */
  getAccountsByTrezorOne = (path, limit, page, callback) => {
    const done = (root) => {
      let addresses = util.deriveChild(limit, page, root.publicKey, root.chainCode).map(item => {
        cache.set('trezorOne-address-' + util.addDPath(path, item.index), item.address);
        return item.address;
      });
      return callback(null, addresses);
    }

    const loadedRootFromCache = cache.get('trezorOne-root-' + path);
    if (loadedRootFromCache) return done(loadedRootFromCache);
    return TrezorOne.getPublickey(path, (er, root) => {
      if (er) return callback(er, null);

      cache.set('trezorOne-root-' + path, root);
      return done(root);
    });
  }
}

module.exports = Trezor;