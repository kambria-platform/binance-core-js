# Introduction

🚀 Binance-Core-JS serves a friendly interface of several Binance wallets and that might help developers can instantly power their Dapps. Binance-Core-JS is an opensource and you can feel free to use it as well as contribute it.

* [View release log](./RELEASE.md)

# How to use?

## Install

```
npm install --save binance-core-js
```

### Usage:

# Network Identity

We formalize the network id follow Ethereum standards, it would helps developers minimize the network id mindset. Because this specification is self-defined, so don't use it outside of this project.

```
mainnet: 1
testnet: 2
```

# API

## BnbClient module

In case you would like to fetch some info from blockchain without account association, `BnbClient` is for you.

You can find the document [here](https://github.com/binance-chain/javascript-sdk/wiki/API-Documentation)

```
import { BnbClient } from 'binance-core-js';
```

## Trust (Trust Wallet) module

```
import { Trust } from 'binance-core-js';

var net = 2 \\ Your network id

var getApproval = (txParams, callback) => {
  // This function is show off the approval with transaction's params
  // When user approve, return callback(null, true)
  // If denied, return callback(null, false)
}

var getAuthentication = {
  open: (qrcode, callback) => {
    // This function is to show off the QRcode to user
    // User must use Trust Wallet on their phone to scan the QRcode and establish the connection
    // When the connection is established, callback will be called
  },
  close: () => {
    // Turn off the modal
  }
}

const options = {
  getApproval,
  getAuthentication
}

var trust = new Trust(net, options);

trust.getAccountsByTrustWallet((er, address) => {
  if (er) return console.error(er);

  console.log('Address:', address);
});

trust.setAccountByTrustWallet((er, client) => {
  if (er) return console.error(er);

  console.log('Provider instance is:', trust);
});
```

## BinanceSDK module

BinanceSDK is a group of software wallets. It includes mnemonic, keystore and private key. All of them are sensitive data, so we do not recommend to use it.

```
import { BinanceSDK } from 'binance-core-js';

var net = 2 \\ Your network id

var getApproval = (txParams, callback) => {
  // This function is show off the approval with transaction's params
  // When user approve, return callback(null, true)
  // If denied, return callback(null, false)
}

var getPassphrase = (callback) => {
  // This function to show off the input form
  // User must enter a temporary passphrase to protect the data in this session
  // When user entered passphrase, return callback(null, passphrase)
  // If denied, return callback('Reason msg', null)
}

const options = {
  getApproval,
  getAuthentication
}

var binanceSDK = new BinanceSDK(net, options);


// Privatekey

var privatekey = ... // Private key
binanceSDK.getAccountByPrivatekey(privatekey, (er, address) => {
  if (er) return console.error(er);

  console.log('Address:', address);
});

var privatekey = ... // Private key
binanceSDK.setAccountByPrivatekey(privatekey, (er, web3) => {
  if (er) return console.error(er);

  console.log('Provider instance is:', binanceSDK);
});


// Mnemonic

var mnemonic = ... // Mnemonic string
var limit = ... // The number of records in a page (pagination)
var page = ... // Page index (pagination)
binanceSDK.getAccountsByMnemonic(mnemonic, limit, page, (er, addresses) => {
  if (er) return console.error(er);

  console.log('Address list:', addresses);
});

var mnemonic = ... // Mnemonic string
var index = ... // Address index
var binanceSDK.setAccountByMnemonic(mnemonic, index, (er, client) => {
  if (er) return console.error(er);

  console.log('Provider instance is:', binanceSDK);
});


// Keystore

var input = ... // Json object of keystore
var password = .. // Keystore password
binanceSDK.getAccountByKeystore(input, password, (er, address) => {
  if (er) return console.error(er);

  console.log('Address:', address);
});

var input = ... // Json object of keystore
var password = .. // Keystore password
binanceSDK.setAccountByKeystore(input, password, (er, web3) => {
  if (er) return console.error(er);

  console.log('Provider instance is:', binanceSDK);
});
```

## Ledger module

```
import { Ledger } from 'binance-core-js';

var net = 2 \\ Your network id

var getApproval = (txParams, callback) => {
  // This function is show off the approval with transaction's params
  // When user approve, return callback(null, true)
  // If denied, return callback(null, false)
}

var getWaiting = {
  open: () => {
    // Open waiting modal
  },
  close: () => {
    // Close waiting modal
  }
}

const options = {
  getApproval,
  getWaiting
}

var ledger = new Ledger(net, options);

var path = ... // Derivation path
var limit = ... // The number of records in a page (pagination)
var page = ... // Page index (pagination)
ledger.getAccountsByLedgerNanoS(path, limit, page, (er, addresses) => {
  if (er) return console.error(er);

  console.log('Address list:', addresses);
});

var path = ... // Derivation path
var index = ... // Derivation child index
ledger.setAccountByLedgerNanoS(path, index, (er, client) => {
  if (er) return console.error(er);

  console.log('Provider instance is:', ledger);
});
```

## Fetch account info

After received a `provider` instance. You can fetch account info by `fetch` function.

```
provider.fetch().then(result => {
  console.log('Result:', result);
}).catch(error => {
  console.log('Error:', error);
});
```

## Watch changes of account info

After received a `provider` instance. You can watch account info if any changes by `watch` function.

```
let watcher = provider.watch((er, re) => {
  if(er) return console.error(er);

  // Called only when having a change.
  console.log(re);
});
```

To stop watching,

```
watcher.stopWatching();
```

# Examples

```
import React, { Component } from 'react';
import { BinanceSDK } from 'binance-core-js';

const NETWORK = 2;
const TYPE = 'softwallet';
const RESTRICT = true;

const accOpts = {
  mnemonic: 'expand lake',
  password: null,
  path: "m/44'/60'/0'/0",
  i: 0
}

class Example extends Component {
  constructor() {
    super();

    this.options = {
      getApprove: this.getApprove,
      getPassphrase: this.getPassphrase
    }
    this.binanceSDK = new BinanceSDK(NETWORK, TYPE, RESTRICT);
  }

  componentDidMount() {
    this.binanceSDK.setAccountByMnemonic(accOpts.mnemonic, accOpts.index, (er, re) => {
      if (er) return console.error(er);

      console.log('Provider instance is:', this.binanceSDK);
    });
  }

  getApprove = (txParams, callback) => {
    var approved = window.confirm(JSON.stringify(txParams));
    if (approved) return callback(null, true);
    return callback(null, false);
  }

  getPassphrase(callback) {
    var passphrase = window.prompt('Please enter passphrase:');
    if (!passphrase) return callback('User denied signing transaction', null);
    return callback(null, passphrase);
  }
}

export default Example;
```

## How to test?

Because this package supports many wallets that were built for many enviroments, many purposes by many parties. As a complex result, a general test scheme is very difficult. We might implement e2e tests by utilizing React as a redering machine for running Selenium, Mocha and Chai.

The related folder for testing comprises `public`, `src` (React folders) and `test` (Test descriptions).

### E2E test

```
npm test
```

### Tool test

```
npm start
```

## Appendix

### Cheatsheet

|   #   | Commands         | Descriptions                  |
| :---: | ---------------- | ----------------------------- |
|   1   | `npm install`    | Install module packages       |
|   2   | `npm run build`  | Build libraries in production |
|   3   | `npm test`       | Run e2e test                  |
|   4   | `npm start`      | Run tool test (testnet)       |
|   5   | `npm run mainnet`| Run tool test (mainnet)       |