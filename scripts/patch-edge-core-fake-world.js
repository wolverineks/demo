/**
 * edge-core-js install patches for this CRA demo.
 *
 * saveUser: 0.18+ round-trips a cleaned login dump through
 * asLoginPayload(wasLoginDump(server)). asLoginDump.created does not
 * uncleaner Dates, so makeEdgeContext throws and the fake user never
 * lands on disk.
 *
 * plugins-selectors: 0.19 ships an ESM-only file with no imports.
 * CRA webpack 4 then reports named exports as missing. Keep a real
 * import so the module graph exports findCurrencyPluginId.
 */
const fs = require('fs')
const path = require('path')

const needle = `async function saveUser(io, user) {
  const { lastLogin, loginId, loginKey, repos, server } = user
  const username = fixUsername(user.username)

  // Save the stash:
  const stash = applyLoginPayload(
    {
      appId: '',
      lastLogin,
      loginId,
      pendingVouchers: [],
      username
    },
    loginKey,
    asLoginPayload(wasLoginDump(server))
  )
  const path = \`logins/\${base58.stringify(loginId)}.json\`
  await io.disklet
    .setText(path, JSON.stringify(wasLoginStash(stash)))
    .catch(() => {})
`

const replacement = `function jsonSafe(value) {
  if (value instanceof Uint8Array) return base64.stringify(value)
  if (value instanceof Date) return value.toISOString()
  if (Array.isArray(value)) return value.map(jsonSafe)
  if (value != null && typeof value === 'object') {
    const out = {}
    for (const key of Object.keys(value)) out[key] = jsonSafe(value[key])
    return out
  }
  return value
}

async function saveUser(io, user) {
  // EDGE_DEMO_SAVEUSER_PATCH
  const { lastLogin, loginId, loginKey, repos, server } = user
  const username = fixUsername(user.username)

  const stash = applyLoginPayload(
    {
      appId: '',
      lastLogin,
      loginId,
      pendingVouchers: [],
      username
    },
    loginKey,
    { ...server, pendingVouchers: server.pendingVouchers || [] }
  )
  const path = \`logins/\${base58.stringify(loginId)}.json\`
  let text
  try {
    text = JSON.stringify(wasLoginStash(stash))
  } catch (error) {
    text = JSON.stringify(jsonSafe(stash))
  }
  await io.disklet.setText(path, text)
`

function patchFile(relPath, apply) {
  const target = path.join(__dirname, '..', relPath)
  if (!fs.existsSync(target)) {
    console.warn('skip patch, missing', relPath)
    return
  }
  const source = fs.readFileSync(target, 'utf8')
  const next = apply(source)
  if (next == null) return
  if (next === source) {
    console.warn('skip patch, source changed', relPath)
    return
  }
  fs.writeFileSync(target, next)
  console.log('patched', relPath)
}

patchFile('node_modules/edge-core-js/lib/core/fake/fake-world.js', source => {
  if (source.includes('EDGE_DEMO_SAVEUSER_PATCH')) return null
  if (!source.includes(needle)) return source
  return source.replace(needle, replacement)
})

patchFile('node_modules/edge-core-js/lib/core/plugins/plugins-selectors.js', source => {
  if (source.includes('EDGE_DEMO_ESM_PATCH')) return null
  return (
    "import { makeLog } from '../log/log'\n\n// EDGE_DEMO_ESM_PATCH\n" +
    source +
    '\nexport const __edgeDemoKeepEsm = makeLog\n'
  )
})

// Webpack 5 prefers package exports over the browser field. Add a browser
// condition so CRA does not bundle the Node io (makeNodeDisklet).
const pkgPath = path.join(__dirname, '../node_modules/edge-core-js/package.json')
if (fs.existsSync(pkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
  const entry = pkg.exports && pkg.exports['.']
  if (entry && entry.browser !== './lib/browser.js') {
    pkg.exports['.'] = {
      'react-native': entry['react-native'],
      browser: './lib/browser.js',
      import: entry.import,
      require: entry.require,
      types: entry.types,
    }
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
    console.log('patched', 'node_modules/edge-core-js/package.json')
  }
}

const mixFetchSrc = path.join(__dirname, '../src/shims/mix-fetch.js')
const mixFetchDest = path.join(__dirname, '../node_modules/@nymproject/mix-fetch/index.js')
if (fs.existsSync(mixFetchSrc) && fs.existsSync(path.dirname(mixFetchDest))) {
  fs.copyFileSync(mixFetchSrc, mixFetchDest)
  console.log('patched', 'node_modules/@nymproject/mix-fetch/index.js')
}

const scryptSrc = path.join(__dirname, '../src/shims/scrypt.js')
const scryptDest = path.join(__dirname, '../node_modules/edge-core-js/lib/util/crypto/scrypt.js')
if (fs.existsSync(scryptSrc) && fs.existsSync(scryptDest)) {
  fs.copyFileSync(scryptSrc, scryptDest)
  console.log('patched', 'node_modules/edge-core-js/lib/util/crypto/scrypt.js')
}
