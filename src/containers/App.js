import React, { Component } from 'react';
import { BrowserRouter, Route, Link, Switch, Redirect } from 'react-router-dom';

import TestBinanceSDK from './testBinanceSDK';
import TestLedger from './testLedger';

const margin = { margin: '10px' }

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <div>
          <header>
            <Link style={margin} to='/binancesdk'>Test Binance SDK</Link>
            <Link style={margin} to='/ledger'>Test Ledger</Link>
          </header>
          <main style={margin}>
            <Switch>
              <Redirect exact from='/' to='/binancesdk' />
              <Route exact path='/binancesdk' component={TestBinanceSDK} />
              <Route exact path='/ledger' component={TestLedger} />
            </Switch>
          </main>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
