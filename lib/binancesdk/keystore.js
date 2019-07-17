var keythereum = require('keythereum');
var privatekey = require('./privatekey');

/**
 * Softwallet type
 */
var Keystore = {}

Keystore.recover = (input, password, callback) => {
  keythereum.recover(password, input, (priv) => {
    return callback(privatekey.privatekeyToAccount(priv));
  });
}

module.exports = Keystore;