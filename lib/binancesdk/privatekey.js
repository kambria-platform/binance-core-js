var BnbClient = require('@binance-chain/javascript-sdk');
var BnbCrypto = BnbClient.crypto;
var util = require('../util');

/**
 * Softwallet type
 */
let Privatekey = {}

Privatekey.privatekeyToAccount = (priv) => {
  if (!priv) return null;
  if (typeof priv !== 'string') priv = priv.toString();
  else if (!Buffer.isBuffer(priv)) return null;
  let addr = null;
  try { addr = BnbCrypto.getAddressFromPrivateKey(priv); }
  catch (er) { if (er) return null; }
  if (!addr) return null;
  return { address: addr, privateKey: priv }
}

module.exports = Privatekey;