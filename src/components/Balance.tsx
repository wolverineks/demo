import { EdgeCurrencyWallet, EdgeTokenId } from 'edge-core-js'
import * as React from 'react'

import { useBalance, useFiatCurrencyCode } from '../hooks'
import { DisplayAmount, FiatAmount } from '.'

export const Balance = ({ wallet, tokenId }: { wallet: EdgeCurrencyWallet; tokenId: EdgeTokenId }) => {
  const balance = useBalance(wallet, tokenId)
  const [fiatCurrencyCode] = useFiatCurrencyCode(wallet)

  return (
    <>
      <DisplayAmount nativeAmount={balance} pluginId={wallet.currencyInfo.pluginId} tokenId={tokenId} /> -{' '}
      <FiatAmount nativeAmount={balance} wallet={wallet} tokenId={tokenId} fiatCurrencyCode={fiatCurrencyCode} />
    </>
  )
}
