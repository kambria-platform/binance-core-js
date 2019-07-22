var bech32 = require('bech32');
var WalletInterface = require('../interface/walletInterface');
var WalletConnect = require('./walletConnectBrowser').default;
var Provider = require('../provider');
var util = require('../util');

const SIGNALER_URL = 'https://bridge.walletconnect.org';
const ERROR = 'The connection was expired';


class Trust extends WalletInterface {
  constructor(net, type, restrict) {
    super(net, type, restrict);

    this.walletConnector = new WalletConnect({ bridge: SIGNALER_URL });
    this.walletConnector.preventDuplicatedEvents = false;

    this.walletConnector.on('session_update', (er, re) => {
      console.log('RtcUpdatedEvent', er, re);
    });
    this.walletConnector.on('disconnect', (er, re) => {
      console.log('RtcClosedEvent');
      this.walletConnector.preventDuplicatedEvents = false;
    });
  }

  setAccountByTrustWallet = (getAuthentication, callback) => {
    this.walletConnector.createSession().then(() => {
      let code = this.walletConnector.uri;
      return getAuthentication.open(code, (er, re) => {
        // User close authentication modal
        if (er) return callback(er, null);
      });
    });
    this.walletConnector.on('connect', (er, re) => {
      if (er) return callback(er, null);
      if (this.walletConnector.preventDuplicatedEvents) return; // Prevent double calls
      this.walletConnector.preventDuplicatedEvents = true;
      getAuthentication.close();
      this.provider = new Provider.HybridWallet(this.net);
      let accOpts = {
        getAddress: this.getAddress,
        signTransaction: this.signTransaction,
        killSession: this.killSession
      }
      this.provider.init(accOpts, (er, client) => {
        if (er) return callback(er, null);
        this.client = client;
        return callback(null, client);
      });
    });
  }

  getAccountsByTrustWallet = (callback) => {
    return this.getAddress((er, re) => {
      if (er) return callback(er, null);
      return (null, [re]);
    });
  }

  getAddress = (callback) => {
    if (this.walletConnector.connected) {
      if (this.walletConnector.bnbAddress) return callback(null, this.walletConnector.bnbAddress);
      this.walletConnector.getAccounts().then(re => {
        let addr = re.filter(payload => payload.network == 714)[0].address;
        if (!addr) return callback(ERROR, null);
        // Trust Wallet have not supported tbnb, we must convert it manually
        addr = bech32.encode(util.getBnbPrefix(this.net), bech32.decode(addr).words);
        // Cache
        this.walletConnector.bnbAddress = addr;
        return callback(null, addr);
      }).catch(er => {
        return callback(er, null);
      });
    } else {
      return callback(ERROR, null);
    }
  }

  signTransaction = (signBytes, callback) => {
    if (this.walletConnector.connected) {
      let payload = {
        method: "bnb_sign",
        params: [JSON.parse(signBytes.toString())]
      }
      this.walletConnector.sendCustomRequest(payload).then(re => {
        re = JSON.parse(re);
        let data = {
          publicKey: re.publicKey,
          signature: Buffer.from(re.signature, 'hex')
        }
        return callback(null, data);
      }).catch(er => {
        return callback(er, null);
      });
    }
    else {
      return callback(ERROR, null);
    }
  }

  killSession = () => {
    window.localStorage.removeItem('walletconnect');
    this.walletConnector.killSession();
  }
}

module.exports = Trust;