import { EdgeAccount, EdgeCurrencyWallet } from 'edge-core-js'
import * as React from 'react'
import { useMutation, useQuery } from 'react-query'

import { optimisticMutationOptions } from '../../utils'

const queryKey = (id: string) => ['lastKnownWalletState', id] as const
const storeId = 'lastKnownWalletStates'

export const useReadLastKnownWalletState = ({ account, walletId }: { account: EdgeAccount; walletId: string }) =>
  useQuery({
    queryKey: queryKey(walletId),
    queryFn: () => account.dataStore.getItem(storeId, walletId).then(JSON.parse) as Promise<WalletState>,
    config: { suspense: true, cacheTime: 0 },
  }).data!

export const useWriteLastKnownWalletState = ({
  account,
  wallet,
}: {
  account: EdgeAccount
  wallet: EdgeCurrencyWallet
}) => {
  const [update] = useMutation(
    () => account.dataStore.setItem(storeId, wallet.id, JSON.stringify(wallet)),
    // optimisticMutationOptions<void>(queryKey(wallet.id)),
  )

  React.useEffect(() => {
    const unsubs = (Object.keys(wallet) as (keyof EdgeCurrencyWallet)[]).map((key) => wallet.watch(key, () => update()))

    update()

    return () => {
      unsubs.forEach((unsub) => unsub())
    }
  }, [account, wallet, update])
}

export type WalletState = {
  id: string
  keys: EdgeCurrencyWallet['keys']
  type: string
  publicWalletInfo: EdgeCurrencyWallet['publicWalletInfo']
  disklet: Record<string, unknown>
  localDisklet: Record<string, unknown>
  displayPrivateSeed: string | null
  displayPublicSeed: string | null
  name: string | null
  fiatCurrencyCode: string
  currencyInfo: EdgeCurrencyWallet['currencyInfo']
  balances: EdgeCurrencyWallet['balances']
  blockHeight: number
  syncRatio: number
  otherMethods: EdgeCurrencyWallet['otherMethods']
}
