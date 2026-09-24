import { EdgeCurrencyWallet, EdgeTokenId } from 'edge-core-js'
import React from 'react'

import { useEdgeAccount } from '../auth'
import { getFiatInfo, useCryptoInfo, useDisplayAmount, useFiatAmount, useTickerFiatAmount } from '../hooks'

export const FiatAmount = ({
  nativeAmount,
  wallet,
  tokenId,
  pluginId,
  fromCurrencyCode,
  fiatCurrencyCode,
}: {
  nativeAmount: string
  fiatCurrencyCode: string
  wallet?: EdgeCurrencyWallet
  tokenId?: EdgeTokenId
  pluginId?: string
  fromCurrencyCode?: string
}) => {
  const account = useEdgeAccount()
  const fiatAmount =
    wallet != null && tokenId !== undefined ? (
      <TokenFiat
        account={account}
        wallet={wallet}
        tokenId={tokenId}
        nativeAmount={nativeAmount}
        fiatCurrencyCode={fiatCurrencyCode}
      />
    ) : pluginId != null ? (
      <PluginFiat
        account={account}
        pluginId={pluginId}
        tokenId={tokenId ?? null}
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

const TokenFiat = ({
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
  const fiatInfo = getFiatInfo(fiatCurrencyCode)
  const fiatAmount = useFiatAmount({ account, wallet, tokenId, nativeAmount, fiatCurrencyCode })
  const { name, symbol, amount } = useDisplayAmount({
    account,
    info: fiatInfo,
    nativeAmount: String(fiatAmount),
  })

  return (
    <>
      {symbol} {Number(amount).toFixed(2)} {name}
    </>
  )
}

const PluginFiat = ({
  account,
  pluginId,
  tokenId,
  nativeAmount,
  fiatCurrencyCode,
}: {
  account: ReturnType<typeof useEdgeAccount>
  pluginId: string
  tokenId: EdgeTokenId
  nativeAmount: string
  fiatCurrencyCode: string
}) => {
  const fromInfo = useCryptoInfo(account, pluginId, tokenId)
  const fiatInfo = getFiatInfo(fiatCurrencyCode)
  const fiatAmount = useTickerFiatAmount({ account, nativeAmount, fromInfo, fiatCurrencyCode })
  const { name, symbol, amount } = useDisplayAmount({
    account,
    info: fiatInfo,
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
  const fromInfo = useCryptoInfo(account, fromCurrencyCode)
  const fiatInfo = getFiatInfo(fiatCurrencyCode)
  const fiatAmount = useTickerFiatAmount({ account, nativeAmount, fromInfo, fiatCurrencyCode })
  const { name, symbol, amount } = useDisplayAmount({
    account,
    info: fiatInfo,
    nativeAmount: String(fiatAmount),
  })

  return (
    <>
      {symbol} {Number(amount).toFixed(2)} {name}
    </>
  )
}
