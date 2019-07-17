const ADDRESS = require('./address');

class LocalStorage {

  static get = () => {
    return JSON.parse(window.localStorage.getItem(ADDRESS.STORAGE));
  }

  static set = (value) => {
    if (!value) return console.error('Value cannot be null');
    return window.localStorage.setItem(ADDRESS.STORAGE, JSON.stringify(value));
  }

  static remove = () => {
    return window.localStorage.removeItem(ADDRESS.STORAGE);
  }
}

module.exports = LocalStorage;