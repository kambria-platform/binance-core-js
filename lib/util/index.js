var HDKey = require('hdkey');
var BnbClient = require('@binance-chain/javascript-sdk');

let Util = {}

Util.getNetworkId = (net, type) => {
  if (Buffer.isBuffer(net)) net = Number(net.toString('hex'));
  net = net.toString().toLowerCase();
  switch (net) {
    case '1':
      if (type === 'string') return 'mainnet';
      if (type === 'number') return 1;
      if (type === 'buffer') return Buffer.from('01', 'hex');
      return 1;
    case 'mainnet':
      if (type === 'string') return 'mainnet';
      if (type === 'number') return 1;
      if (type === 'buffer') return Buffer.from('01', 'hex');
      return 1;
    case '2':
      if (type === 'string') return 'testnet';
      if (type === 'number') return 2;
      if (type === 'buffer') return Buffer.from('02', 'hex');
      return 3;
    case 'testnet':
      if (type === 'string') return 'testnet';
      if (type === 'number') return 2;
      if (type === 'buffer') return Buffer.from('02', 'hex');
      return 3;
    default:
      return null;
  }
}

Util.padHex = (hex) => {
  if (!hex) return null;
  if (Buffer.isBuffer(hex)) hex = hex.toString('hex');
  if (typeof hex !== 'string') return null;

  var pattern = /(^0x)/gi;
  if (pattern.test(hex)) {
    return hex;
  } else {
    return '0x' + hex;
  }
}

Util.unpadHex = (hex) => {
  if (!hex) return null;
  if (Buffer.isBuffer(hex)) hex = hex.toString('hex');
  if (typeof hex !== 'string') return null;

  var pattern = /(^0x)/gi;
  if (pattern.test(hex)) {
    return hex.replace('0x', '');
  } else {
    return hex;
  }
}

Util.signRawTx = (txParams, priv) => {
  var rawTx = Util.genRawTx(txParams).raw;
  rawTx.sign(Buffer.from(priv, 'hex'));
  var signedTx = Util.padHex(rawTx.serialize().toString('hex'));
  return signedTx;
}

Util.addDPath = (dpath, index) => {
  if (!dpath || typeof dpath !== 'string') return null;
  dpath = dpath.trim();
  index = index || 0;
  index = index.toString();
  index = index.trim();

  var _dpath = dpath.split('');
  if (_dpath[_dpath.length - 1] === '/') {
    _dpath.pop();
    dpath = _dpath.join('');
  } else {
    dpath = _dpath.join('');
  }
  var _index = index.split('');
  if (_index[0] === '/') {
    _index.shift();
    index = _index.join('');
  } else {
    index = _index.join('');
  }

  return dpath + '/' + index;
}

Util.deriveChild = (limit, page, publicKey, chainCode) => {
  let list = [];
  let hdKey = new HDKey();
  hdKey.publicKey = Buffer.from(publicKey, 'hex');
  hdKey.chainCode = Buffer.from(chainCode, 'hex');
  for (let index = page * limit; index < page * limit + limit; index++) {
    let child = hdKey.derive('m/' + index);
    let addr = BnbClient.crypto.getAddressFromPublicKey(child.publicKey);
    let re = { index: index.toString(), address: Util.padHex(addr.toString('hex')) }
    list.push(re);
  }
  return list;
}

module.exports = Util;