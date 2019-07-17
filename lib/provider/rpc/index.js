const RPC = {
  MAINNET: {
    id: 1,
    network: 'mainnet',
    name: 'Binance-Chain-Tigris',
    rpc: 'https://dex.binance.org'
  },
  TESTNET: {
    id: 2,
    network: 'testnet',
    name: 'Binance-Chain-Nile',
    rpc: 'https://testnet-dex.binance.org'
  }
}

let getRPC = (net) => {
  switch (net) {
    case 1:
      return RPC.MAINNET.rpc;
    case 2:
      return RPC.TESTNET.rpc;
    case 'Binance-Chain-Tigris':
      return RPC.MAINNET.rpc;
    case 'Binance-Chain-Nile':
      return RPC.TESTNET.rpc;
    case 'mainnet':
      return RPC.MAINNET.rpc;
    case 'testnet':
      return RPC.TESTNET.rpc;
    default:
      return null;
  }
}

let getNetwork = (net) => {
  switch (net) {
    case 1:
      return RPC.MAINNET.network;
    case 2:
      return RPC.TESTNET.network;
    case 'Binance-Chain-Tigris':
      return RPC.MAINNET.network;
    case 'Binance-Chain-Nile':
      return RPC.TESTNET.network;
    case 'mainnet':
      return RPC.MAINNET.network;
    case 'testnet':
      return RPC.TESTNET.network;
    default:
      return null;
  }
}

module.exports = { getRPC, getNetwork };