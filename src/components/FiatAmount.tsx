import { EdgeTokenId } from 'edge-core-js'
import React from 'react'

import { useEdgeAccount } from '../auth'
import { getFiatInfo, useCryptoInfo, useDisplayAmount, useTickerFiatAmount } from '../hooks'

export const FiatAmount = ({
  nativeAmount,
  pluginId,
  tokenId = null,
  fiatCurrencyCode,
}: {
  nativeAmount: string
  pluginId: string
  tokenId?: EdgeTokenId
  fiatCurrencyCode: string
}) => {
  const account = useEdgeAccount()
  const fromInfo = useCryptoInfo(account, pluginId, tokenId)
  const fiatInfo = getFiatInfo(fiatCurrencyCode)
  const fiatAmount = useTickerFiatAmount({ account, nativeAmount, fromInfo, fiatCurrencyCode })
  const { name, symbol, amount } = useDisplayAmount({
    account,
    info: fiatInfo,
    nativeAmount: String(fiatAmount),
  })

  return (
    <>
      {symbol} {Number(amount).toFixed(2)} {name}
    </>
  )
}
