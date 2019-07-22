module.exports = {

  getAccounts: (callback) => {
    let er = 'getAccounts() is not set yet';
    console.error(er);
    return callback(er, null);
  },

  signTransaction: (callback) => {
    let er = 'signTransaction() is not set yet';
    console.error(er);
    return callback(er, null);
  },

  killSession: () => {
    let er = 'killSession() is not set yet';
    return console.error(er);
  }
  
}