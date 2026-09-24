import React from 'react'

import { useEdgeAccount } from '../auth'
import { useWatch } from '../hooks'
import { getCurrencyIconCandidates } from '../utils'

export const Logo: React.FC<{
  pluginId: string
  tokenId?: string | null
  contractAddress?: string
}> = ({ pluginId, tokenId, contractAddress }) => {
  const account = useEdgeAccount()
  const currencyConfig = account.currencyConfig[pluginId]
  useWatch(currencyConfig, 'allTokens')

  const currencyCode =
    currencyConfig == null
      ? undefined
      : tokenId != null
      ? currencyConfig.allTokens[tokenId]?.currencyCode
      : currencyConfig.currencyInfo.currencyCode

  const candidates = React.useMemo(
    () =>
      getCurrencyIconCandidates({
        pluginId,
        currencyCode,
        tokenId: tokenId ?? undefined,
        contractAddress,
        isToken: tokenId != null || !!contractAddress,
      }),
    [contractAddress, currencyCode, pluginId, tokenId],
  )
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
