/**
 * edge-core-js 0.18.14 saveUser round-trips a cleaned login dump through
 * asLoginPayload(wasLoginDump(server)). asLoginDump.created is a custom
 * cleaner that does not uncleaner Dates, so makeEdgeContext throws and the
 * fake user never lands on disk.
 *
 * Apply this after yarn install.
 */
const fs = require('fs')
const path = require('path')

const target = path.join(__dirname, '../node_modules/edge-core-js/lib/core/fake/fake-world.js')

if (!fs.existsSync(target)) {
  console.warn('skip fake-world patch: edge-core-js not installed')
  process.exit(0)
}

const source = fs.readFileSync(target, 'utf8')
if (source.includes('EDGE_DEMO_SAVEUSER_PATCH')) {
  process.exit(0)
}

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

if (!source.includes(needle)) {
  console.error('skip fake-world patch: saveUser source changed')
  process.exit(1)
}

fs.writeFileSync(target, source.replace(needle, replacement))
console.log('patched edge-core-js fake-world saveUser')
