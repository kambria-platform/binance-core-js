var BnbCrypto = require('@binance-chain/javascript-sdk').crypto;

/**
 * Softwallet type
 */
var Keystore = {}

Keystore.keystoreToAccount = (input, password, prefix) => {
  if (!input) return null;
  try {
    let priv = BnbCrypto.getPrivateKeyFromKeyStore(input, password);
    let addr = BnbCrypto.getAddressFromPrivateKey(priv, prefix);
    return { address: addr, privateKey: priv }
  } catch (er) {
    console.error(er);
    return null;
  }
}

module.exports = Keystore;