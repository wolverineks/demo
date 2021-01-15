import { EdgeAccount, EdgeCurrencyWallet } from 'edge-core-js'
import React from 'react'
import { UseQueryOptions, useMutation, useQuery, useQueryClient } from 'react-query'

import { useInvalidateQueries } from '.'

export const useWalletSnapshots = (walletIds: string[]) => {
  const queryClient = useQueryClient()
  const snapshots = queryClient.getQueryCache().findAll(['snapshot'])
  const wallets = snapshots.map((query) => query.state.data) as InactiveWallet[]

  return wallets.filter(({ id }) => walletIds.includes(id))
}

export const useReadWalletSnapshot = (
  account: EdgeAccount,
  walletId: string,
  queryOptions?: UseQueryOptions<InactiveWallet>,
) => {
  return useQuery({
    queryKey: ['snapshot', walletId],
    queryFn: () => account.dataStore.getItem('snapshot', walletId).then(JSON.parse) as Promise<InactiveWallet>,
    ...queryOptions,
  }).data!
}

export const useWriteWalletSnapshot = (account: EdgeAccount, wallet: EdgeCurrencyWallet) => {
  const mutation = () => account.dataStore.setItem('snapshot', wallet.id, JSON.stringify(wallet))
  const { mutate: update } = useMutation(mutation, {
    ...useInvalidateQueries([['snapshot', wallet.id]]),
  })

  React.useEffect(() => {
    const unsubs = (Object.keys(wallet) as (keyof EdgeCurrencyWallet)[]).map((key) => wallet.watch(key, () => update()))

    update()

    return () => {
      unsubs.forEach((unsub) => unsub())
    }
  }, [account, wallet, update])
}

export type InactiveWallet = Pick<
  EdgeCurrencyWallet,
  | 'id'
  | 'type'
  | 'keys'
  | 'name'
  | 'fiatCurrencyCode'
  | 'currencyInfo'
  | 'balances'
  | 'blockHeight'
  | 'displayPrivateSeed'
  | 'displayPublicSeed'
  | 'publicWalletInfo'
  | 'syncRatio'
  | 'otherMethods'
>
