import React from 'react'

import { useAccount } from '../auth'
import { useFiatAmount } from '../hooks'
import { getFiatInfo } from './getFiatInfo'

export const FiatAmount = ({
  nativeAmount,
  fromCurrencyCode,
  fiatCurrencyCode,
}: {
  nativeAmount: string
  fiatCurrencyCode: string
  fromCurrencyCode: string
}) => {
  const account = useAccount()
  const fiatAmount = useFiatAmount({
    account,
    nativeAmount,
    fromCurrencyCode,
    fiatCurrencyCode,
  })
  const fiatInfo = getFiatInfo(fiatCurrencyCode)

  return (
    <>
      {fiatInfo.symbol} {fiatAmount.toFixed(2)} {fiatInfo.currencyCode}
    </>
  )
}
