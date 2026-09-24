import { EdgeCurrencyWallet, EdgeTokenId } from 'edge-core-js'
import React from 'react'

import { useEdgeAccount } from '../auth'
import { useCryptoInfo, useTokenDisplayAmount, useDisplayAmount } from '../hooks'

export const DisplayAmount = ({
  nativeAmount,
  wallet,
  tokenId,
  currencyCode,
}: {
  nativeAmount: string
  wallet?: EdgeCurrencyWallet
  tokenId?: EdgeTokenId
  currencyCode?: string
}) => {
  if (wallet != null && tokenId !== undefined) {
    return <TokenDisplay nativeAmount={nativeAmount} wallet={wallet} tokenId={tokenId} />
  }

  return <TickerDisplay nativeAmount={nativeAmount} currencyCode={currencyCode!} />
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
