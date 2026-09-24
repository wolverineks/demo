import { EdgeCurrencyWallet, EdgeTokenId } from 'edge-core-js'
import React from 'react'

import { useEdgeAccount } from '../auth'
import { useCryptoInfo, useDisplayAmount, useTokenDisplayAmount } from '../hooks'

export const DisplayAmount = ({
  nativeAmount,
  wallet,
  tokenId,
  pluginId,
  currencyCode,
}: {
  nativeAmount: string
  wallet?: EdgeCurrencyWallet
  tokenId?: EdgeTokenId
  pluginId?: string
  currencyCode?: string
}) => {
  if (wallet != null && tokenId !== undefined) {
    return <TokenDisplay nativeAmount={nativeAmount} wallet={wallet} tokenId={tokenId} />
  }

  if (pluginId != null) {
    return <PluginDisplay nativeAmount={nativeAmount} pluginId={pluginId} tokenId={tokenId ?? null} />
  }

  return <TickerDisplay nativeAmount={nativeAmount} currencyCode={currencyCode!} />
}

const PluginDisplay = ({
  nativeAmount,
  pluginId,
  tokenId,
}: {
  nativeAmount: string
  pluginId: string
  tokenId: EdgeTokenId
}) => {
  const account = useEdgeAccount()
  const info = useCryptoInfo(account, pluginId, tokenId)
  const { name, symbol, amount } = useDisplayAmount({ account, info, nativeAmount })

  return (
    <>
      {symbol} {amount} {name}
    </>
  )
}

const TokenDisplay = ({
  nativeAmount,
  wallet,
  tokenId,
}: {
  nativeAmount: string
  wallet: EdgeCurrencyWallet
  tokenId: EdgeTokenId
}) => {
  const account = useEdgeAccount()
  const { name, symbol, amount } = useTokenDisplayAmount({ account, wallet, tokenId, nativeAmount })

  return (
    <>
      {symbol} {amount} {name}
    </>
  )
}

const TickerDisplay = ({ nativeAmount, currencyCode }: { nativeAmount: string; currencyCode: string }) => {
  const account = useEdgeAccount()
  const info = useCryptoInfo(account, currencyCode)
  const { name, symbol, amount } = useDisplayAmount({ account, info, nativeAmount })

  return (
    <>
      {symbol} {amount} {name}
    </>
  )
}
