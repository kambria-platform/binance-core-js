var BnbClient = require('@binance-chain/javascript-sdk');
var BnbCrypto = BnbClient.crypto;
var util = require('../util');
var { cache, localStorage, sessionStorage } = require('../storage');

const ERROR = require('../constant/error');

class WalletInterface {

  /**
   * Constructor
   * @param {*} net - network id
   * @param {*} type - softwallet/hardwallet/hybridwallet
   * @param {*} restricted - disallow network change
   */
  constructor(net, type, restricted) {
    this.net = net ? util.getNetworkId(net, 'string') : 'testnet';
    this.pre = util.getBnbPrefix(this.net);
    this.type = type;
    this.restricted = restricted;

    this.provider = null;
    this.client = null;

    this.user = {
      network: this.net,
      account: null,
      balance: null,
    };
  }

  /**
   * Check valid address
   * @param {*} address 
   */
  isAddress = (address) => {
    if (!this.client) return new Error(ERROR.CANNOT_FOUND_PROVIDER);
    return this.client.checkAddress(address);
  }

  /**
   * Get network id
   */
  getNetwork = () => {
    return new Promise((resolve, reject) => {
      if (!this.client) return reject(ERROR.CANNOT_FOUND_PROVIDER);
      return resolve(this.net);
    });
  }

  /**
   * Get account info
   */
  getAccount = () => {
    return new Promise((resolve, reject) => {
      if (!this.client) return reject(ERROR.CANNOT_FOUND_PROVIDER);
      this.client.getAccounts((er, re) => {
        if (er) return reject(er);
        if (re.length <= 0 || !re[0] || !this.isAddress(re[0])) return reject(ERROR.CANNOT_GET_ACCOUNT);
        return resolve(re[0]);
      });
    });
  }

  /**
   * Get account balance
   * @param {*} address 
   */
  getBalance = (address) => {
    return new Promise((resolve, reject) => {
      if (!this.client) return reject(ERROR.CANNOT_FOUND_PROVIDER);
      if (!this.isAddress(address)) return reject(ERROR.INVALID_ADDRESS);
      this.client.getBalance(address).then(re => {
        return resolve(util.getBalanceBySymbol(re, 'BNB'));
      }).catch(er => {
        console.log(er)
        return reject(er);
      });
    });
  }

  /**
   * Fetch info of user
   */
  fetch = () => {
    return new Promise((resolve, reject) => {
      let data = {};
      this.getNetwork().then(re => {
        data.network = re;
        return this.getAccount();
      }).then(re => {
        data.account = re;
        if (!data.account) return reject(ERROR.CANNOT_GET_ACCOUNT);
        return this.getBalance(data.account);
      }).then(re => {
        data.balance = re;
        return resolve(data);
      }).catch(er => {
        return reject(er);
      });
    });
  }

  /**
   * Watch any changes of provider
   */
  _watch = (callback) => {
    this.fetch().then(re => {
      let changedFlag = false;
      // Network changed
      if (this.user.network !== re.network) {
        if (this.restricted) return callback(ERROR.INVALID_NETWORK, null);
        this.user.network = re.network;
        changedFlag = true;
      }
      // Account changed
      if (this.user.account !== re.account) {
        this.user.account = re.account;
        changedFlag = true;
      }
      // Balance changed
      if (this.user.balance !== re.balance) {
        this.user.balance = re.balance;
        changedFlag = true;
      }
      // Only call back when having a change
      if (changedFlag) return callback(null, JSON.parse(JSON.stringify(this.user)));
    }).catch(er => {
      return callback(er, null);
    });
  }
  watch = (callback) => {
    // Check client instance
    if (!this.client) {
      callback(ERROR.CANNOT_FOUND_PROVIDER, null);
      return null;
    }
    this.timer = setInterval(() => {
      this._watch(callback);
    }, 3000);
    // Web3ProviderEngine does not support synchronous
    return { stopWatching: () => { clearInterval(timer); } };
  }

  /**
   * Logout
   */
  logout = () => {
    // Stop watching
    if (this.timer) clearInterval(this.timer);
    // Clear cache
    cache.removeAll();
    localStorage.remove();
    sessionStorage.remove();
    // Clear global vars
    this.client = null;
    this.provider = null;
  }
}

module.exports = WalletInterface;