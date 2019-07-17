var localStorage = require('./localStorage');
var sessionStorage = require('./sessionStorage'); // Recommend to use
var cache = require('./cache');
const ADDRESS = require('./address');

module.exports = {
  localStorage: localStorage,
  sessionStorage: sessionStorage,
  cache: cache,
  // constants
  ADDRESS: ADDRESS
}