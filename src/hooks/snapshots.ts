import { EdgeCurrencyWallet, EdgeTokenId } from 'edge-core-js'
import React from 'react'
import { UseQueryOptions, useMutation, useQuery } from 'react-query'

import { useEdgeAccount } from '../auth'
import { getWalletTokenIds } from '../utils'
import { useInvalidateQueries } from '.'

export type SnapshotTokenBalance = {
  tokenId: EdgeTokenId
  nativeAmount: string
}

export type InactiveWallet = {
  id: string
  name: string | null
  fiatCurrencyCode: string
  pluginId: string
  tokenBalances: SnapshotTokenBalance[]
}

type LegacySnapshot = {
  id: string
  name?: string | null
  fiatCurrencyCode: string
  pluginId?: string
  currencyInfo?: { pluginId: string; currencyCode: string }
  balances?: { [currencyCode: string]: string }
  tokenBalances?: SnapshotTokenBalance[]
}

export const toWalletSnapshot = (wallet: EdgeCurrencyWallet): InactiveWallet => ({
  id: wallet.id,
  name: wallet.name,
  fiatCurrencyCode: wallet.fiatCurrencyCode,
  pluginId: wallet.currencyInfo.pluginId,
  tokenBalances: getWalletTokenIds(wallet).flatMap((tokenId) => {
    if (tokenId != null && wallet.currencyConfig.allTokens[tokenId] == null) return []

    return [{ tokenId, nativeAmount: wallet.balanceMap.get(tokenId) ?? '0' }]
  }),
})

export const walletSnapshotFromJson = (raw: LegacySnapshot): InactiveWallet => {
  const pluginId = raw.pluginId ?? raw.currencyInfo?.pluginId
  if (!pluginId) throw new Error('Invalid wallet snapshot')

  if (raw.tokenBalances) {
    return {
      id: raw.id,
      name: raw.name ?? null,
      fiatCurrencyCode: raw.fiatCurrencyCode,
      pluginId,
      tokenBalances: raw.tokenBalances,
    }
  }

  return {
    id: raw.id,
    name: raw.name ?? null,
    fiatCurrencyCode: raw.fiatCurrencyCode,
    pluginId,
    tokenBalances: [
      {
        tokenId: null,
        nativeAmount: raw.balances?.[raw.currencyInfo?.currencyCode ?? ''] ?? '0',
      },
    ],
  }
}

export const useReadWalletSnapshot = (walletId: string, queryOptions?: UseQueryOptions<InactiveWallet>) => {
  const account = useEdgeAccount()

  return useQuery({
    queryKey: ['snapshot', walletId],
    queryFn: () =>
      account.dataStore
        .getItem('snapshot', walletId)
        .then(JSON.parse)
        .then(walletSnapshotFromJson) as Promise<InactiveWallet>,
    ...queryOptions,
  }).data!
}

export const useWriteWalletSnapshot = (wallet: EdgeCurrencyWallet) => {
  const account = useEdgeAccount()
  const mutation = () => account.dataStore.setItem('snapshot', wallet.id, JSON.stringify(toWalletSnapshot(wallet)))
  const { mutate: update } = useMutation(mutation, {
    ...useInvalidateQueries([['snapshot', wallet.id]]),
  })

  React.useEffect(() => {
    const keys = ['name', 'balanceMap', 'enabledTokenIds', 'fiatCurrencyCode'] as const
    const unsubs = keys.map((key) => wallet.watch(key, () => update()))

    update()

    return () => {
      unsubs.forEach((unsub) => unsub())
    }
  }, [account, wallet, update])
}
