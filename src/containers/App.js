import React, { Component } from 'react';
import { BrowserRouter, Route, Link, Switch, Redirect } from 'react-router-dom';

import TestBinanceSDK from './testBinanceSDK';
import TestLedger from './testLedger';
import TestTrust from './testTrust';

const margin = { margin: '10px' }

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <div>
          <header>
            <Link style={margin} to='/binancesdk'>Test Binance SDK</Link>
            <Link style={margin} to='/ledger'>Test Ledger</Link>
            <Link style={margin} to='/trust'>Test Trust</Link>
          </header>
          <main style={margin}>
            <Switch>
              <Redirect exact from='/' to='/binancesdk' />
              <Route exact path='/binancesdk' component={TestBinanceSDK} />
              <Route exact path='/ledger' component={TestLedger} />
              <Route exact path='/trust' component={TestTrust} />
            </Switch>
          </main>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
