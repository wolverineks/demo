import { EdgeCurrencyInfo, EdgeMetaToken } from 'edge-core-js'
import * as React from 'react'

import { useAccount } from '../Auth'
import { getFiatInfo } from './getFiatInfo'
import { useFiatAmount } from './useFiatAmount'

export const FiatAmount = ({
  currencyInfo,
  toCurrencyCode,
  nativeAmount,
}: {
  currencyInfo: EdgeCurrencyInfo | EdgeMetaToken
  toCurrencyCode: string
  nativeAmount: string
}) => {
  const account = useAccount()
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
