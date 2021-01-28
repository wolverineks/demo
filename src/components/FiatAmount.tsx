import React from 'react'

import { useEdgeAccount } from '../auth'
import { useDisplayAmount, useFiatAmount } from '../hooks'

export const FiatAmount = ({
  nativeAmount,
  fromCurrencyCode,
  fiatCurrencyCode,
}: {
  nativeAmount: string
  fiatCurrencyCode: string
  fromCurrencyCode: string
}) => {
  const account = useEdgeAccount()

  const fiatAmount = useFiatAmount({
    account,
    nativeAmount,
    fromCurrencyCode,
    fiatCurrencyCode,
  })

  const { name, symbol, amount } = useDisplayAmount({
    account,
    currencyCode: fiatCurrencyCode,
    nativeAmount: String(fiatAmount),
  })

  return (
    <>
      {symbol} {Number(amount).toFixed(2)} {name}
    </>
  )
}
