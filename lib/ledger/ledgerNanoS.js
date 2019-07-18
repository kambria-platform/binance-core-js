var { LedgerApp } = require('@binance-chain/javascript-sdk').ledger;
var BnbCrypto = require('@binance-chain/javascript-sdk').crypto;
var TransportU2F = require('@ledgerhq/hw-transport-u2f').default;
var TransportWebUSB = require('@ledgerhq/hw-transport-webusb').default;
var util = require('../util');
const error = require('../constant/error');
const _default = require('../constant/default');

/**
 * Hardwallet type
 */
let LedgerNanoS = {}

LedgerNanoS.getPublickeyAndAddress = (dpath, prefix, callback) => {
  dpath = dpath || util.addDPath(_default.BNB_DERIVATION_PATH, _default.ACCOUNT_INDEX);
  dpath = util.dpath2Array(dpath);

  LedgerNanoS.getCommunication((er, bnb) => {
    if (er) return callback(er, null);

    bnb.getPublicKey(dpath).then(re => {
      if (!re || !re.pk || !Buffer.isBuffer(re.pk)) return callback(error.CANNOT_CONNECT_HARDWARE, null);
      let pub = re.pk.toString('hex');
      let addr = BnbCrypto.getAddressFromPublicKey(pub, prefix);
      return callback(null, { publicKey: pub, address: addr });
    }).catch(er => {
      return callback(er, null);
    });
  });
}

LedgerNanoS.signTransaction = (dpath, prefix, signBytes, callback) => {
  dpath = dpath || util.addDPath(_default.BNB_DERIVATION_PATH, _default.ACCOUNT_INDEX);
  dpath = util.dpath2Array(dpath);
  if (!signBytes || !Buffer.isBuffer(signBytes)) return callback(error.INVALID_TX, null);

  LedgerNanoS.getCommunication((er, bnb) => {
    if (er) return callback(er, null);

    bnb.showAddress(prefix, dpath).then(re => {
      return bnb.sign(signBytes, dpath);
    }).then(re => {
      if (!re || !re.signature) return callback(error.CANNOT_CONNECT_HARDWARE, null);

      return callback(null, re.signature);
    }).catch(er => {
      return callback(er, null);
    });
  });
}

LedgerNanoS.getCommunication = (callback) => {
  if (LedgerNanoS.bnb) return callback(null, LedgerNanoS.bnb);

  LedgerNanoS.getTransport((er, transport) => {
    if (er) return callback(er, null);

    LedgerNanoS.bnb = new LedgerApp(transport);
    return callback(null, LedgerNanoS.bnb);
  });
}

LedgerNanoS.getTransport = (callback) => {
  let webusbSupported = false;
  let u2fSupported = false;

  TransportWebUSB.isSupported().then(re => {
    webusbSupported = re;
    return TransportU2F.isSupported();
  }).then(re => {
    u2fSupported = re;
    if (u2fSupported) return TransportU2F.create();
    if (webusbSupported) return TransportWebUSB.create();
    return callback(error.UNSUPPORT_HARDWARE, null);
  }).then(transport => {
    return callback(null, transport);
  }).catch(er => {
    return callback(er, null);
  });
}

LedgerNanoS.closeTransport = (transport) => {
  return transport.close();
}

module.exports = LedgerNanoS;