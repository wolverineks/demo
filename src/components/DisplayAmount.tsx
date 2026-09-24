import { EdgeTokenId } from 'edge-core-js'
import React from 'react'

import { useEdgeAccount } from '../auth'
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
  const account = useEdgeAccount()
  const info = useCryptoInfo(account, pluginId, tokenId)
  const { name, symbol, amount } = useDisplayAmount({
    account,
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
