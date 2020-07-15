import TrezorConnect from 'trezor-connect';
var util = require('../util');
const error = require('../constant/error');
const _default = require('../constant/default');

// Register trezor manifest
TrezorConnect.manifest({
  email: 'tphanson@kambria.io',
  appUrl: 'https://github.com/kambria-platform/binance-core-js'
});

/**
 * Hardwallet type
 */
const TrezorOne = {}

TrezorOne.getAddress = (dpath, callback) => {
  dpath = dpath || util.addDPath(_default.ETH_DERIVATION_PATH, _default.ACCOUNT_INDEX);

  return TrezorConnect.binanceGetAddress({ path: dpath, showOnTrezor: false }).then(re => {
    if (!re.success) return callback(error.CANNOT_CONNECT_HARDWARE, null);
    return callback(null, re.payload.address);
  }).catch(er => {
    return callback(er, null);
  });
}

TrezorOne.getPublickey = (dpath, callback) => {
  dpath = dpath || util.addDPath(_default.ETH_DERIVATION_PATH, _default.ACCOUNT_INDEX);

  return TrezorConnect.getPublicKey({ path: dpath, coin: 'bnb' }).then(re => {
    if (!re.success) return callback(error.CANNOT_CONNECT_HARDWARE, null);
    return callback(null, re.payload);
  }).catch(er => {
    return callback(er, null);
  });
}

TrezorOne.signTransaction = (dpath, txParams, callback) => {
  dpath = dpath || util.addDPath(_default.ETH_DERIVATION_PATH, _default.ACCOUNT_INDEX);
  if (!txParams) return callback(error.INVALID_TX, null);

  txParams.gasLimit = txParams.gas;
  delete txParams.gas;
  return TrezorConnect.binanceSignTransaction({
    path: dpath,
    transaction: txParams
  }).then(re => {
    if (!re.success) return callback(error.CANNOT_SIGN_TX, null);
    re.payload.r = util.unpadHex(re.payload.r);
    re.payload.s = util.unpadHex(re.payload.s);
    re.payload.v = util.unpadHex(re.payload.v);
    return callback(null, re.payload);
  }).catch(er => {
    return callback(er, null);
  });
}

module.exports = TrezorOne;