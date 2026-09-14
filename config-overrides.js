const fs = require('fs')
const path = require('path')

const extraSrc = [
  'ecpair',
  '@edge.app',
  '@ethereumjs',
  'tiny-secp256k1',
  'uint8array-tools',
  'edge-currency-plugins',
  'edge-currency-accountbased',
  'edge-core-js',
  'edge-exchange-plugins',
  'ethereumjs-util',
  'ethereumjs-wallet',
  'ethereumjs-abi',
  'eth-sig-util',
  'ethers',
].map((name) => path.resolve('node_modules', name))

const ensureEthereumBrowserFiles = () => {
  const accountbased = path.resolve('node_modules/edge-currency-accountbased/lib/ethereum')
  if (!fs.existsSync(accountbased)) return

  const destDir = path.join(accountbased, 'abi')
  const srcDir = path.resolve('src/shims/ethereum-abi')
  fs.mkdirSync(destDir, { recursive: true })
  for (const file of ['ETH_BAL_CHECKER_ABI.json', 'NODE_INTERFACE_ABI.json']) {
    fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file))
  }

  // Keep Solana/Filecoin/other EVMs out of the ETH webpack graph.
  fs.writeFileSync(
    path.join(accountbased, 'ethereumInfos.js'),
    `'use strict'
const { ethereum } = require('./info/ethereumInfo')
const { polygon } = require('./info/polygonInfo')
const { optimism } = require('./info/optimismInfo')
exports.ethereumPlugins = { ethereum, polygon, optimism }
`,
  )

  fs.writeFileSync(
    path.join(accountbased, 'networkAdapters/FilfoxAdapter.js'),
    `'use strict'
exports.FilfoxAdapter = class FilfoxAdapter {
  constructor() {
    throw new Error('FilfoxAdapter is omitted from this browser build')
  }
}
`,
  )
}

module.exports = function override(config) {
  ensureEthereumBrowserFiles()

  config.resolve.alias = {
    ...config.resolve.alias,
    '@nymproject/mix-fetch$': path.resolve('src/shims/mix-fetch.js'),
  }

  const walk = (rules) => {
    for (const rule of rules || []) {
      if (rule.oneOf) walk(rule.oneOf)
      if (
        rule.loader &&
        String(rule.loader).includes('babel-loader') &&
        rule.include &&
        String(rule.include).includes(`${path.sep}src`)
      ) {
        rule.include = [rule.include, ...extraSrc]
      }
    }
  }

  walk(config.module.rules)
  return config
}
