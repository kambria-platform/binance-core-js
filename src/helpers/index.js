import React from 'react';
import configs from '../config';


class Helper {

  static linkToBinanceExplorer = (txId) => {
    if (!txId) return null;
    return <a href={configs.explorer.base + configs.explorer.tx + txId} target="_blank" rel="noopener noreferrer">{txId}</a>;
  }
}

export default Helper;