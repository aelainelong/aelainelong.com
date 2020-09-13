import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './app/App';

ReactDOM.render(<App />, document.getElementById('root'));

// Enable Hot Module Reloading
if(module.hot){
  module.hot.accept('./app/App', () => {
    const NextApp = require('./app/App').default;
    ReactDOM.render(<NextApp />, document.getElementById('root'));
  });
}
