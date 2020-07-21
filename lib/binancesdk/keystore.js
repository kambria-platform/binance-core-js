var { crypto } = require('@binance-chain/javascript-sdk');

/**
 * Softwallet type
 */
var Keystore = {}

Keystore.keystoreToAccount = (input, password, prefix) => {
  if (!input) return null;
  try {
    const priv = crypto.getPrivateKeyFromKeyStore(input, password);
    const addr = crypto.getAddressFromPrivateKey(priv, prefix);
    return { address: addr, privateKey: priv }
  } catch (er) {
    console.error(er);
    return null;
  }
}

module.exports = Keystore;