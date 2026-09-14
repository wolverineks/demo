const mixFetch = (...args) => fetch(...args)

const createMixFetch = async () => mixFetch

const disconnectMixFetch = async () => undefined

module.exports = {
  mixFetch,
  createMixFetch,
  disconnectMixFetch,
  default: mixFetch,
}
