import { EdgeCurrencyWallet } from 'edge-core-js'
import * as React from 'react'

import { useBalance } from '../hooks'
import { DisplayAmount, FiatAmount } from '.'

export const Balance = ({ wallet, currencyCode }: { wallet: EdgeCurrencyWallet; currencyCode: string }) => {
  const balance = useBalance(wallet, currencyCode)

  return (
    <>
      <DisplayAmount nativeAmount={balance} currencyCode={currencyCode} /> -{' '}
      <FiatAmount nativeAmount={balance} fromCurrencyCode={currencyCode} fiatCurrencyCode={wallet.fiatCurrencyCode} />
    </>
  )
}
