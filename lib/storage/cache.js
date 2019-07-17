const ADDRESS = require('./address');

class Cache {

  static get = (key) => {
    if (!key) return null;
    let data = JSON.parse(window.sessionStorage.getItem(ADDRESS.CACHE)) || {};
    return data[key];
  }

  static getAll = () => {
    return JSON.parse(window.sessionStorage.getItem(ADDRESS.CACHE))
  }

  static set = (key, value) => {
    if (!key || !value) return console.error('Key or value is null');
    let data = JSON.parse(window.sessionStorage.getItem(ADDRESS.CACHE)) || {};
    data[key] = value;
    return window.sessionStorage.setItem(ADDRESS.CACHE, JSON.stringify(data));
  }

  static setAll = (value) => {
    return window.sessionStorage.setItem(ADDRESS.CACHE, JSON.stringify(value));
  }

  static remove = (key) => {
    if (!key) return console.error('Key is null');
    let data = JSON.parse(window.sessionStorage.getItem(ADDRESS.CACHE)) || {};
    delete data[key];
    return window.sessionStorage.setItem(ADDRESS.CACHE, JSON.stringify(data));
  }

  static removeAll = () => {
    return window.sessionStorage.removeItem(ADDRESS.CACHE);
  }
}

module.exports = Cache;