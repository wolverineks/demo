import { EdgeAccount } from 'edge-core-js'

const EDGE_ICON_SERVER = 'https://content.edge.app/currencyIconsV3'
const GENERIC_ICON_SERVER = 'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/32/color'

export const UNKNOWN_CURRENCY_ICON = '/unknown-currency.png'

export const contractToTokenId = (contractAddress?: string) => {
  if (!contractAddress) return undefined

  return contractAddress.toLowerCase().replace(/^0x/, '')
}

export const getCurrencyIconCandidates = ({
  pluginId,
  currencyCode,
  tokenId,
  contractAddress,
  isToken = false,
}: {
  pluginId?: string
  currencyCode?: string
  tokenId?: string
  contractAddress?: string
  isToken?: boolean
}) => {
  const plugin = pluginId?.toLowerCase()
  const code = currencyCode?.toLowerCase()
  const id = tokenId || contractToTokenId(contractAddress)
  const urls: string[] = []

  if (plugin && isToken && id) {
    urls.push(`${EDGE_ICON_SERVER}/${plugin}/${id}.png`)
  } else if (plugin) {
    urls.push(`${EDGE_ICON_SERVER}/${plugin}/${plugin}.png`)
  }

  if (code) {
    urls.push(`${GENERIC_ICON_SERVER}/${code}.png`)
  }

  urls.push(UNKNOWN_CURRENCY_ICON)

  return urls.filter((url, index, list) => list.indexOf(url) === index)
}

export const getCurrencyIconUri = (pluginId?: string, currencyCode?: string, isToken = false, tokenId?: string) => {
  return getCurrencyIconCandidates({ pluginId, currencyCode, tokenId, isToken })[0]
}

export const getTokenIconLocation = (account: EdgeAccount, currencyCode: string) => {
  const configs = [
    ...Object.keys(account.currencyConfig).map((pluginId) => account.currencyConfig[pluginId]),
    ...Object.keys(account.currencyWallets)
      .map((walletId) => account.currencyWallets[walletId])
      .filter(Boolean)
      .map((wallet) => wallet.currencyConfig),
  ]

  for (const config of configs) {
    if (!config?.currencyInfo) continue

    const pluginId = config.currencyInfo.pluginId
    if (config.currencyInfo.currencyCode === currencyCode) {
      return {
        pluginId,
        tokenId: undefined as string | undefined,
        contractAddress: undefined as string | undefined,
        isToken: false,
      }
    }

    const meta = (config.currencyInfo.metaTokens || []).find((token) => token.currencyCode === currencyCode)
    if (meta) {
      return {
        pluginId,
        tokenId: contractToTokenId(meta.contractAddress),
        contractAddress: meta.contractAddress,
        isToken: true,
      }
    }

    const tokens = { ...(config.builtinTokens || {}), ...(config.allTokens || {}) }
    for (const tokenId of Object.keys(tokens)) {
      if (tokens[tokenId].currencyCode !== currencyCode) continue

      const contractAddress = (tokens[tokenId].networkLocation as { contractAddress?: string } | undefined)
        ?.contractAddress

      return { pluginId, tokenId, contractAddress, isToken: true }
    }
  }

  return {
    pluginId: undefined as string | undefined,
    tokenId: undefined as string | undefined,
    contractAddress: undefined as string | undefined,
    isToken: false,
  }
}
