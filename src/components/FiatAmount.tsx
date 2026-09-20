import { EdgeCurrencyWallet, EdgeTokenId } from 'edge-core-js'
import React from 'react'

import { useEdgeAccount } from '../auth'
import { useDisplayAmount, useFiatAmount, useTickerFiatAmount } from '../hooks'

export const FiatAmount = ({
  nativeAmount,
  wallet,
  tokenId,
  fromCurrencyCode,
  fiatCurrencyCode,
}: {
  nativeAmount: string
  fiatCurrencyCode: string
  wallet?: EdgeCurrencyWallet
  tokenId?: EdgeTokenId
  fromCurrencyCode?: string
}) => {
  const account = useEdgeAccount()
  const fiatAmount =
    wallet != null && tokenId !== undefined ? (
      <AssetFiat
        account={account}
        wallet={wallet}
        tokenId={tokenId}
        nativeAmount={nativeAmount}
        fiatCurrencyCode={fiatCurrencyCode}
      />
    ) : (
      <TickerFiat
        account={account}
        fromCurrencyCode={fromCurrencyCode!}
        nativeAmount={nativeAmount}
        fiatCurrencyCode={fiatCurrencyCode}
      />
    )

  return fiatAmount
}

const AssetFiat = ({
  account,
  wallet,
  tokenId,
  nativeAmount,
  fiatCurrencyCode,
}: {
  account: ReturnType<typeof useEdgeAccount>
  wallet: EdgeCurrencyWallet
  tokenId: EdgeTokenId
  nativeAmount: string
  fiatCurrencyCode: string
}) => {
  const fiatAmount = useFiatAmount({ account, wallet, tokenId, nativeAmount, fiatCurrencyCode })
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

const TickerFiat = ({
  account,
  fromCurrencyCode,
  nativeAmount,
  fiatCurrencyCode,
}: {
  account: ReturnType<typeof useEdgeAccount>
  fromCurrencyCode: string
  nativeAmount: string
  fiatCurrencyCode: string
}) => {
  const fiatAmount = useTickerFiatAmount({ account, nativeAmount, fromCurrencyCode, fiatCurrencyCode })
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
