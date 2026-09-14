const path = require('path')

const extraSrc = [
  'ecpair',
  '@edge.app',
  'tiny-secp256k1',
  'uint8array-tools',
  'edge-currency-plugins',
  'edge-core-js',
  'edge-exchange-plugins',
].map((name) => path.resolve('node_modules', name))

module.exports = function override(config) {
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
