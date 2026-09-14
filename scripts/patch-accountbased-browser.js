/**
 * edge-currency-accountbased 0.11.x always imports Hedera and Zcash.
 * Hedera's protobuf filenames break CRA's case-sensitive webpack plugin;
 * Zcash wants react-native-zcash. Strip both from the browser plugin map.
 */
const fs = require('fs')
const path = require('path')

const target = path.join(__dirname, '../node_modules/edge-currency-accountbased/lib/index.js')

if (!fs.existsSync(target)) {
  console.warn('skip accountbased patch: package not installed')
  process.exit(0)
}

const source = fs.readFileSync(target, 'utf8')
if (source.includes('EDGE_DEMO_ACCOUNTBASED_BROWSER_PATCH')) {
  process.exit(0)
}

const needle = `import { makeFioPlugin } from './fio/fioPlugin'
import { makeHederaPlugin } from './hedera/hederaInfo.js'
import { makeStellarPlugin } from './stellar/stellarPlugin.js'
import { makeTezosPlugin } from './tezos/tezosPlugin.js'
import { makeRipplePlugin } from './xrp/xrpPlugin.js'
import { makeZcashPlugin } from './zcash/zecPlugin.js'

const plugins = {
  eos: makeEosPlugin,
  telos: makeTelosPlugin,
  wax: makeWaxPlugin,
  ethereum: makeEthereumPlugin,
  ethereumclassic: makeEthereumClassicPlugin,
  fantom: makeFantomPlugin,
  fio: makeFioPlugin,
  zcash: makeZcashPlugin,
  // "ripple" is network name. XRP is just an asset:
  ripple: makeRipplePlugin,
  stellar: makeStellarPlugin,
  tezos: makeTezosPlugin,
  rsk: makeRskPlugin,
  binance: makeBinancePlugin,
  hedera: makeHederaPlugin,
  polygon: makePolygonPlugin,
  avalanche: makeAvalanchePlugin
}
`

const replacement = `import { makeFioPlugin } from './fio/fioPlugin'
import { makeStellarPlugin } from './stellar/stellarPlugin.js'
import { makeTezosPlugin } from './tezos/tezosPlugin.js'
import { makeRipplePlugin } from './xrp/xrpPlugin.js'

// EDGE_DEMO_ACCOUNTBASED_BROWSER_PATCH
const plugins = {
  eos: makeEosPlugin,
  telos: makeTelosPlugin,
  wax: makeWaxPlugin,
  ethereum: makeEthereumPlugin,
  ethereumclassic: makeEthereumClassicPlugin,
  fantom: makeFantomPlugin,
  fio: makeFioPlugin,
  // "ripple" is network name. XRP is just an asset:
  ripple: makeRipplePlugin,
  stellar: makeStellarPlugin,
  tezos: makeTezosPlugin,
  rsk: makeRskPlugin,
  binance: makeBinancePlugin,
  polygon: makePolygonPlugin,
  avalanche: makeAvalanchePlugin
}
`

if (!source.includes(needle)) {
  console.warn('skip accountbased patch: plugin map source changed')
  process.exit(0)
}

fs.writeFileSync(target, source.replace(needle, replacement))
console.log('patched edge-currency-accountbased browser plugin map')
