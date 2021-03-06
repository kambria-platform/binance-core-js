var { LedgerApp, transports } = require('@binance-chain/javascript-sdk').ledger;
var { crypto } = require('@binance-chain/javascript-sdk');
var TransportU2F = transports.u2f;
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
var util = require('../util');
const error = require('../constant/error');
const _default = require('../constant/default');

/**
 * Hardwallet type
 */
var LedgerNanoS = {}

LedgerNanoS.getPublickeyAndAddress = (dpath, prefix, callback) => {
  dpath = dpath || util.addDPath(_default.BNB_DERIVATION_PATH, _default.ACCOUNT_INDEX);
  dpath = util.dpath2Array(dpath);

  return LedgerNanoS.getCommunication((er, bnb) => {
    if (er) return callback(er, null);

    return bnb.getPublicKey(dpath).then(re => {
      if (!re || !re.pk || !Buffer.isBuffer(re.pk)) return callback(error.CANNOT_CONNECT_HARDWARE, null);
      const pub = re.pk.toString('hex');
      const addr = crypto.getAddressFromPublicKey(pub, prefix);
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

  return LedgerNanoS.getCommunication((er, bnb) => {
    if (er) return callback(er, null);

    return bnb.showAddress(prefix, dpath).then(re => {
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

  return LedgerNanoS.getTransport((er, transport) => {
    if (er) return callback(er, null);

    LedgerNanoS.bnb = new LedgerApp(transport);
    return callback(null, LedgerNanoS.bnb);
  });
}

LedgerNanoS.getTransport = (callback) => {
  let webusbSupported = false;
  let u2fSupported = false;

  return TransportWebUSB.isSupported().then(re => {
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