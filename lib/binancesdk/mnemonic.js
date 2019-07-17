var BnbCrypto = require('@binance-chain/javascript-sdk').crypto;

/**
 * Softwallet type
 */
let Mnemonic = {}

Mnemonic.mnemonicToAccount = (mnemonic, index, prefix) => {
  if (!mnemonic) return null;
  try {
    let priv = BnbCrypto.getPrivateKeyFromMnemonic(mnemonic.trim(), true, index);
    let addr = BnbCrypto.getAddressFromPrivateKey(priv, prefix);
    return { address: addr, privateKey: priv }
  } catch (er) {
    console.error(er);
    return null;
  }
}

module.exports = Mnemonic;