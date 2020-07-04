import { EdgeAccount, EdgeCurrencyInfo, EdgeMetaToken } from 'edge-core-js'
import * as React from 'react'

import { getFiatInfo } from './getFiatInfo'
import { useFiatAmount } from './useFiatAmount'

export const FiatAmount = ({
  account,
  currencyInfo,
  toCurrencyCode,
  nativeAmount,
}: {
  account: EdgeAccount
  currencyInfo: EdgeCurrencyInfo | EdgeMetaToken
  toCurrencyCode: string
  nativeAmount: string
}) => {
  const fiatAmount = useFiatAmount({
    account,
    currencyInfo,
    toCurrencyCode,
    nativeAmount,
  })
  const fiatInfo = getFiatInfo({ currencyCode: toCurrencyCode })

  return (
    <>
      {fiatInfo.symbol} {fiatAmount.toFixed(2)} {fiatInfo.currencyCode}
    </>
  )
}
