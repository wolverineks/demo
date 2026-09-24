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
