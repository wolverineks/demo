export const mixFetch = (...args) => fetch(...args)

export const createMixFetch = async () => ({ mixFetch })

export const disconnectMixFetch = async () => undefined

export default mixFetch
