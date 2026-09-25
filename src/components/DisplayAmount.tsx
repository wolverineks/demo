import { EdgeTokenId } from 'edge-core-js'
import React from 'react'

import { tokenDenominationKey, useCryptoInfo, useDisplayAmount } from '../hooks'

export const DisplayAmount = ({
  nativeAmount,
  pluginId,
  tokenId = null,
}: {
  nativeAmount: string
  pluginId: string
  tokenId?: EdgeTokenId
}) => {
  const info = useCryptoInfo(pluginId, tokenId)
  const { name, symbol, amount } = useDisplayAmount({
    info,
    nativeAmount,
    storageKey: tokenDenominationKey(pluginId, tokenId),
  })

  return (
    <>
      {symbol} {amount} {name}
    </>
  )
}
