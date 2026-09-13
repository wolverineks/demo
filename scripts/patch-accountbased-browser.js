/**
 * edge-currency-accountbased 0.10.x always imports Hedera and Zcash.
 * Hedera's @hashgraph/sdk protobuf filenames break CRA's case-sensitive
 * webpack plugin; Zcash wants react-native-zcash. Strip both from the
 * browser plugin map after install.
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

let next = source
next = next.replace("import { makeHederaPlugin } from './hedera/hederaInfo.js'\n", '')
next = next.replace("import { makeZcashPlugin } from './zcash/zecPlugin.js'\n", '')
next = next.replace('  zcash: makeZcashPlugin,\n', '')
next = next.replace('  hedera: makeHederaPlugin,\n', '')

if (next === source) {
  console.error('skip accountbased patch: plugin map source changed')
  process.exit(1)
}

next = next.replace(
  "import 'regenerator-runtime/runtime'\n",
  "import 'regenerator-runtime/runtime'\n\n// EDGE_DEMO_ACCOUNTBASED_BROWSER_PATCH\n",
)

fs.writeFileSync(target, next)
console.log('patched edge-currency-accountbased browser plugin map')
