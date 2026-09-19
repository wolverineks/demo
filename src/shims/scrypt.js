// EDGE_DEMO_SCRYPT_ASYNC
const scryptJs = require('scrypt-js')

const lib = scryptJs && scryptJs.default != null ? scryptJs.default : scryptJs
const promiseScrypt = lib && typeof lib.scrypt === 'function' ? lib.scrypt : null
const callbackScrypt = typeof lib === 'function' ? lib : null

const toBytes = (value) => {
  if (typeof value === 'string') {
    const out = []
    for (let i = 0; i < value.length; ++i) out[i] = value.charCodeAt(i)
    return out
  }
  const copy = []
  for (let i = 0; i < value.length; ++i) copy[i] = value[i]
  return copy
}

const scryptAsync = (password, salt, n, r, p, dklen) => {
  if (typeof promiseScrypt === 'function') {
    return Promise.resolve(promiseScrypt(password, salt, n, r, p, dklen))
  }

  if (typeof callbackScrypt !== 'function') {
    return Promise.reject(new Error('scrypt-js API not found'))
  }

  return new Promise((resolve, reject) => {
    callbackScrypt(password, salt, n, r, p, dklen, (error, progress, key) => {
      if (error) reject(error)
      else if (key) resolve(key)
    })
  })
}

function scrypt(data, salt, n, r, p, dklen) {
  return scryptAsync(toBytes(data), toBytes(salt), n, r, p, dklen).then((key) => Uint8Array.from(key))
}

exports.scrypt = scrypt
module.exports = { scrypt }
