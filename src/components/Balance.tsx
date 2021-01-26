import { EdgeCurrencyWallet } from 'edge-core-js'
import * as React from 'react'

import { useBalance, useFiatCurrencyCode } from '../hooks'
import { DisplayAmount, FiatAmount } from '.'

export const Balance = ({ wallet, currencyCode }: { wallet: EdgeCurrencyWallet; currencyCode: string }) => {
  const balance = useBalance(wallet, currencyCode)
  const [fiatCurrencyCode] = useFiatCurrencyCode(wallet)

  return (
    <>
      <DisplayAmount nativeAmount={balance} currencyCode={currencyCode} /> -{' '}
      <FiatAmount nativeAmount={balance} fromCurrencyCode={currencyCode} fiatCurrencyCode={fiatCurrencyCode} />
    </>
  )
}
