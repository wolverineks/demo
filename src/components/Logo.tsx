import React from 'react'

import { useEdgeAccount } from '../auth'
import { useWatch } from '../hooks'
import { getCurrencyIconCandidates } from '../utils'

export const Logo: React.FC<{
  pluginId?: string
  tokenId?: string | null
  currencyCode?: string
  contractAddress?: string
}> = ({ pluginId, tokenId, currencyCode, contractAddress }) => {
  const account = useEdgeAccount()
  const currencyConfig = pluginId ? account.currencyConfig[pluginId] : undefined
  useWatch(currencyConfig, 'allTokens')

  const derivedCurrencyCode =
    currencyConfig == null
      ? undefined
      : tokenId != null
      ? currencyConfig.allTokens[tokenId]?.currencyCode
      : currencyConfig.currencyInfo.currencyCode
  const resolvedCurrencyCode = derivedCurrencyCode ?? currencyCode

  const candidates = React.useMemo(
    () =>
      getCurrencyIconCandidates({
        pluginId,
        currencyCode: resolvedCurrencyCode,
        tokenId: tokenId ?? undefined,
        contractAddress,
        isToken: tokenId != null || !!contractAddress,
      }),
    [contractAddress, pluginId, resolvedCurrencyCode, tokenId],
  )
  const [index, setIndex] = React.useState(0)
  const src = candidates[Math.min(index, candidates.length - 1)]

  React.useEffect(() => {
    setIndex(0)
  }, [candidates])

  return (
    <img
      alt={resolvedCurrencyCode}
      src={src}
      className="currency-logo"
      onError={() => {
        setIndex((current) => Math.min(current + 1, candidates.length - 1))
      }}
    />
  )
}
