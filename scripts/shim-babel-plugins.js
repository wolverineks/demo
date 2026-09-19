/**
 * Yarn hoists newer @babel/plugin-transform-* packages and drops the old
 * @babel/plugin-proposal-* / plugin-syntax-* names that babel-preset-react-app's
 * nested @babel/preset-env@7.12.1 still require()s at load time.
 */
const fs = require('fs')
const path = require('path')

const babelDir = path.join(__dirname, '../node_modules/@babel')
if (!fs.existsSync(babelDir)) process.exit(0)

const canResolve = (name) => {
  try {
    require.resolve(name, { paths: [path.join(__dirname, '..')] })
    return true
  } catch {
    return false
  }
}

const writeShim = (pkgName, indexSource) => {
  if (canResolve(`@babel/${pkgName}`)) return
  const dest = path.join(babelDir, pkgName)
  fs.mkdirSync(dest, { recursive: true })
  fs.writeFileSync(
    path.join(dest, 'package.json'),
    JSON.stringify(
      {
        name: `@babel/${pkgName}`,
        version: '7.8.3',
        main: 'index.js',
      },
      null,
      2,
    ),
  )
  fs.writeFileSync(path.join(dest, 'index.js'), indexSource)
}

const syntaxPlugins = {
  'plugin-syntax-dynamic-import': 'dynamicImport',
  'plugin-syntax-export-namespace-from': 'exportNamespaceFrom',
}

for (const [pkgName, parserPlugin] of Object.entries(syntaxPlugins)) {
  writeShim(
    pkgName,
    `'use strict'
module.exports = function pluginSyntax(api) {
  api.assertVersion(7)
  return {
    name: ${JSON.stringify(pkgName.replace(/^plugin-/, ''))},
    manipulateOptions(_opts, parserOpts) {
      parserOpts.plugins.push(${JSON.stringify(parserPlugin)})
    },
  }
}
`,
  )
}

const proposalToTransform = {
  'plugin-proposal-async-generator-functions': 'plugin-transform-async-generator-functions',
  'plugin-proposal-dynamic-import': 'plugin-transform-dynamic-import',
  'plugin-proposal-export-namespace-from': 'plugin-transform-export-namespace-from',
  'plugin-proposal-json-strings': 'plugin-transform-json-strings',
  'plugin-proposal-logical-assignment-operators': 'plugin-transform-logical-assignment-operators',
  'plugin-proposal-object-rest-spread': 'plugin-transform-object-rest-spread',
  'plugin-proposal-optional-catch-binding': 'plugin-transform-optional-catch-binding',
  'plugin-proposal-unicode-property-regex': 'plugin-transform-unicode-property-regex',
}

for (const [pkgName, transformName] of Object.entries(proposalToTransform)) {
  writeShim(
    pkgName,
    `'use strict'\nmodule.exports = require(${JSON.stringify('@babel/' + transformName)})\n`,
  )
}
