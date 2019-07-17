const ADDRESS = require('./address');

class SessionStorage {

  static get = () => {
    return JSON.parse(window.sessionStorage.getItem(ADDRESS.MEMORY));
  }

  static set = (value) => {
    if (!value) return console.error('Value cannot be null');
    return window.sessionStorage.setItem(ADDRESS.MEMORY, JSON.stringify(value));
  }

  static remove = () => {
    return window.sessionStorage.removeItem(ADDRESS.MEMORY);
  }
}

module.exports = SessionStorage;