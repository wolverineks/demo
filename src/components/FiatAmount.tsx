import { EdgeTokenId } from 'edge-core-js'
import React from 'react'

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
  const fromInfo = useCryptoInfo(pluginId, tokenId)
  const fiatInfo = getFiatInfo(fiatCurrencyCode)
  const fiatAmount = useTickerFiatAmount({ nativeAmount, fromInfo, fiatCurrencyCode })
  const { name, symbol, amount } = useDisplayAmount({
    info: fiatInfo,
    nativeAmount: String(fiatAmount),
  })

  return (
    <>
      {symbol} {Number(amount).toFixed(2)} {name}
    </>
  )
}
