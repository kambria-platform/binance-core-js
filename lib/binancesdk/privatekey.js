var BnbCrypto = require('@binance-chain/javascript-sdk').crypto;

/**
 * Softwallet type
 */
let Privatekey = {}

Privatekey.privatekeyToAccount = (priv, prefix) => {
  if (!priv) return null;
  if (!Buffer.isBuffer(priv)) priv = priv.toString('hex');
  else if (typeof priv !== 'string') priv = priv.toString();
  let addr = null;
  try { addr = BnbCrypto.getAddressFromPrivateKey(priv, prefix); }
  catch (er) { if (er) return null; }
  if (!addr) return null;
  return { address: addr, privateKey: priv }
}

module.exports = Privatekey;