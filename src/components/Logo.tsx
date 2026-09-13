import React from 'react'

import { useEdgeAccount } from '../auth'
import { useInfo } from '../hooks'
import { getCurrencyIconCandidates, getTokenIconLocation, isToken as isTokenInfo } from '../utils'

export const Logo: React.FC<{
  currencyCode: string
  pluginId?: string
  tokenId?: string
  contractAddress?: string
}> = ({ currencyCode, pluginId: pluginIdProp, tokenId: tokenIdProp, contractAddress: contractAddressProp }) => {
  const account = useEdgeAccount()
  const info = useInfo(account, currencyCode)
  const extra = info as {
    pluginId?: string
    tokenId?: string
    contractAddress?: string
    symbolImage?: string
  }
  const iconLocation = getTokenIconLocation(account, currencyCode)
  const pluginId = pluginIdProp || iconLocation.pluginId || extra.pluginId
  const tokenId = tokenIdProp || iconLocation.tokenId || extra.tokenId
  const contractAddress = contractAddressProp || iconLocation.contractAddress || extra.contractAddress
  const isToken = !!(tokenId || contractAddress) || iconLocation.isToken || isTokenInfo(info)
  const symbolImage = extra.symbolImage
  const candidates = React.useMemo(() => {
    const urls = getCurrencyIconCandidates({
      pluginId,
      currencyCode,
      tokenId,
      contractAddress,
      isToken,
    })

    return symbolImage ? [symbolImage, ...urls] : urls
  }, [contractAddress, currencyCode, isToken, pluginId, symbolImage, tokenId])
  const [index, setIndex] = React.useState(0)
  const src = candidates[Math.min(index, candidates.length - 1)]

  React.useEffect(() => {
    setIndex(0)
  }, [candidates])

  return (
    <img
      alt={currencyCode}
      src={src}
      className="currency-logo"
      onError={() => {
        setIndex((current) => Math.min(current + 1, candidates.length - 1))
      }}
    />
  )
}
