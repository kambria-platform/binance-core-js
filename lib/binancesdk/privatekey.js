var { crypto } = require('@binance-chain/javascript-sdk');

/**
 * Softwallet type
 */
var Privatekey = {}

Privatekey.privatekeyToAccount = (priv, prefix) => {
  let addr = null;
  try {
    if (!priv) return null;
    if (!Buffer.isBuffer(priv)) priv = priv.toString('hex');
    else if (typeof priv !== 'string') priv = priv.toString();
    addr = crypto.getAddressFromPrivateKey(priv, prefix);
  }
  catch (er) { if (er) return null; }
  if (!addr) return null;
  return { address: addr, privateKey: priv }
}

module.exports = Privatekey;