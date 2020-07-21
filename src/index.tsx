import './index.css'

import React from 'react'
import * as ReactDOM from 'react-dom'
import { hijackEffects } from 'stop-runaway-react-effects'

import { App } from './App'
import * as serviceWorker from './serviceWorker'

if (process.env.NODE_ENV === 'development') {
  hijackEffects()
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
