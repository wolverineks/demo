const fs = require('fs')
const path = require('path')
const webpack = require('webpack')

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

const ensureMixFetchShim = () => {
  const dest = path.resolve('node_modules/@nymproject/mix-fetch/index.js')
  const src = path.resolve('src/shims/mix-fetch.js')
  if (!fs.existsSync(dest) || !fs.existsSync(src)) return
  fs.copyFileSync(src, dest)
}

const ensureScryptShim = () => {
  const dest = path.resolve('node_modules/edge-core-js/lib/util/crypto/scrypt.js')
  const src = path.resolve('src/shims/scrypt.js')
  if (!fs.existsSync(dest) || !fs.existsSync(src)) return
  fs.copyFileSync(src, dest)
}

const skipNodeModuleBabel = (rules) => {
  for (const rule of rules || []) {
    if (rule.oneOf) skipNodeModuleBabel(rule.oneOf)
    const presets = rule.options && rule.options.presets
    const isDepsBabel =
      rule.loader &&
      String(rule.loader).includes('babel-loader') &&
      Array.isArray(presets) &&
      presets.some((preset) => {
        const name = Array.isArray(preset) ? preset[0] : preset
        return String(name).includes('babel-preset-react-app/dependencies')
      })
    if (isDepsBabel) {
      rule.exclude = [/node_modules/]
    }
  }
}

module.exports = function override(config) {
  ensureEthereumBrowserFiles()
  ensureMixFetchShim()
  ensureScryptShim()
  skipNodeModuleBabel(config.module.rules)

  config.resolve.alias = {
    ...(config.resolve.alias || {}),
    'scrypt-js': require.resolve('scrypt-js'),
  }

  config.resolve.fallback = {
    ...config.resolve.fallback,
    assert: require.resolve('assert/'),
    buffer: require.resolve('buffer/'),
    crypto: require.resolve('crypto-browserify'),
    http: require.resolve('stream-http'),
    https: require.resolve('https-browserify'),
    os: require.resolve('os-browserify/browser'),
    path: require.resolve('path-browserify'),
    process: require.resolve('process/browser'),
    querystring: require.resolve('querystring-es3'),
    stream: require.resolve('stream-browserify'),
    url: require.resolve('url/'),
    vm: require.resolve('vm-browserify'),
    zlib: require.resolve('browserify-zlib'),
    fs: false,
    net: false,
    tls: false,
    child_process: false,
  }

  config.plugins.push(
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
  )

  config.module.rules.push({
    test: /\.m?js$/,
    resolve: { fullySpecified: false },
  })

  config.ignoreWarnings = [/Failed to parse source map/]

  return config
}
