import React from 'react'

import { getCurrencyIconCandidates } from '../utils'

export const Logo: React.FC<{
  currencyCode: string
  pluginId?: string
  tokenId?: string
  contractAddress?: string
}> = ({ currencyCode, pluginId, tokenId, contractAddress }) => {
  const candidates = React.useMemo(
    () =>
      getCurrencyIconCandidates({
        pluginId,
        currencyCode,
        tokenId,
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
