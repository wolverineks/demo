/**
 * npm's lib/ build omits ethereum ABI JSON files. Copy the shims into place
 * and slim ethereumInfos to ETH/Polygon/Optimism so CRA does not pull Filecoin/Solana.
 */
const fs = require('fs')
const path = require('path')

const ethereumDir = path.join(__dirname, '../node_modules/edge-currency-accountbased/lib/ethereum')
const abiSrc = path.join(__dirname, '../src/shims/ethereum-abi')

if (!fs.existsSync(ethereumDir) || !fs.existsSync(abiSrc)) {
  process.exit(0)
}

const abiDest = path.join(ethereumDir, 'abi')
fs.mkdirSync(abiDest, { recursive: true })
for (const file of ['ETH_BAL_CHECKER_ABI.json', 'NODE_INTERFACE_ABI.json']) {
  fs.copyFileSync(path.join(abiSrc, file), path.join(abiDest, file))
}

fs.writeFileSync(
  path.join(ethereumDir, 'ethereumInfos.js'),
  `'use strict'
const { ethereum } = require('./info/ethereumInfo')
const { polygon } = require('./info/polygonInfo')
const { optimism } = require('./info/optimismInfo')
exports.ethereumPlugins = { ethereum, polygon, optimism }
`,
)

fs.writeFileSync(
  path.join(ethereumDir, 'networkAdapters/FilfoxAdapter.js'),
  `'use strict'
exports.FilfoxAdapter = class FilfoxAdapter {
  constructor() {
    throw new Error('FilfoxAdapter is omitted from this browser build')
  }
}
`,
)
