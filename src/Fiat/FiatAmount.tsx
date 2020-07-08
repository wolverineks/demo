import { EdgeCurrencyInfo, EdgeMetaToken } from 'edge-core-js'
import * as React from 'react'

import { useAccount } from '../auth'
import { useFiatAmount } from '../hooks/useFiatAmount'
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
