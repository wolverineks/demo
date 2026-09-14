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
