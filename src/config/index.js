const env = process.env.REACT_APP_ENV || process.env.NODE_ENV;
let configs = null;

if (env === 'development') {
  configs = {
    params: {
      network: 2,
      amount: 1
    },
    explorer: {
      base: 'https://testnet-explorer.binance.org',
      tx: '/tx/'
    }
  }
}

if (env === 'production') {
  configs = {
    params: {
      network: 1,
      amount: 0.0001
    },
    explorer: {
      base: 'https://explorer.binance.org',
      tx: '/tx/'
    }
  }
}
/**
 * Module exports
 */
export default configs;