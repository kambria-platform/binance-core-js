var BnbCrypto = require('@binance-chain/javascript-sdk').crypto;

/**
 * Softwallet type
 */
var Mnemonic = {}

Mnemonic.mnemonicToAccount = (mnemonic, index, prefix) => {
  if (!mnemonic) return null;
  try {
    const priv = BnbCrypto.getPrivateKeyFromMnemonic(mnemonic.trim(), true, index);
    const addr = BnbCrypto.getAddressFromPrivateKey(priv, prefix);
    return { address: addr, privateKey: priv }
  } catch (er) {
    console.error(er);
    return null;
  }
}

module.exports = Mnemonic;