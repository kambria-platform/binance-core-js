var bip39 = require('bip39');
var HDKey = require('ethereumjs-wallet/hdkey');
var util = require('../util');
const _default = require('../constant/default');

/**
 * Softwallet type
 */
let Mnemonic = {}

Mnemonic.mnemonicToSeed = (mnemonic, password, callback) => {
  bip39.mnemonicToSeed(mnemonic.trim(), password).then(seed => {
    return callback(seed);
  }).catch(er => {
    console.error(er);
    return callback(null);
  });
}

Mnemonic.seedToHDKey = (seed) => {
  if (!Buffer.isBuffer(seed)) {
    console.error('Seed must be type of buffer');
    return null;
  }
  return HDKey.fromMasterSeed(seed);
}

Mnemonic.hdkeyToAddress = (hdkey, dpath, index) => {
  dpath = dpath || _default.ETH_DERIVATION_PATH;
  dpath = util.addDPath(dpath, index);
  let child = hdkey.derivePath(dpath);
  let addr = child.getWallet().getAddress();
  return util.padHex(addr.toString('hex'));
}

Mnemonic.hdkeyToAccount = (hdkey, dpath, index) => {
  dpath = dpath || _default.ETH_DERIVATION_PATH;
  dpath = util.addDPath(dpath, index);
  let account = hdkey.derivePath(dpath);
  let priv = account.getWallet().getPrivateKey();
  let addr = account.getWallet().getAddress();
  return { address: util.padHex(addr.toString('hex')), privateKey: priv.toString('hex') }
}

module.exports = Mnemonic;