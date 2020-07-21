var { crypto } = require('@binance-chain/javascript-sdk');

/**
 * Softwallet type
 */
var Mnemonic = {}

Mnemonic.mnemonicToAccount = (mnemonic, index, prefix) => {
  if (!mnemonic) return null;
  try {
    const priv = crypto.getPrivateKeyFromMnemonic(mnemonic.trim(), true, index);
    const addr = crypto.getAddressFromPrivateKey(priv, prefix);
    return { address: addr, privateKey: priv }
  } catch (er) {
    console.error(er);
    return null;
  }
}

module.exports = Mnemonic;