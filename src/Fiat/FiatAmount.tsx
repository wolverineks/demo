import { EdgeCurrencyInfo, EdgeMetaToken } from 'edge-core-js'
import React from 'react'

import { useAccount } from '../auth'
import { useFiatAmount } from '../hooks'
import { getFiatInfo } from './getFiatInfo'

export const FiatAmount = ({
  currencyInfo,
  toCurrencyCode,
  nativeAmount,
}: {
  currencyInfo: EdgeCurrencyInfo | EdgeMetaToken
  toCurrencyCode: string
  nativeAmount: string
}) => {
  const fiatAmount = useFiatAmount(useAccount(), currencyInfo, toCurrencyCode, nativeAmount)
  const fiatInfo = getFiatInfo({ currencyCode: toCurrencyCode })

  return (
    <>
      {fiatInfo.symbol} {fiatAmount.toFixed(2)} {fiatInfo.currencyCode}
    </>
  )
}
