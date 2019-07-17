import React, { Component } from 'react';
import { BrowserRouter, Route, Link, Switch, Redirect } from 'react-router-dom';

import TestBinanceSDK from './testBinanceSDK';

const margin = { margin: '10px' }

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <div>
          <header>
            <Link style={margin} to='/binancesdk'>Test Binance SDK</Link>
          </header>
          <main style={margin}>
            <Switch>
              <Redirect exact from='/' to='/binancesdk' />
              <Route exact path='/binancesdk' component={TestBinanceSDK} />
            </Switch>
          </main>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
