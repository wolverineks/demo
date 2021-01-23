import { EdgeAccount, EdgeCreateCurrencyWalletOptions, EdgeCurrencyWallet, EdgeWalletState } from 'edge-core-js'
import React from 'react'
import { UseQueryOptions, useMutation, useQuery } from 'react-query'

import {
  getActiveInfos,
  getExchangeDenomination,
  getFiatInfo,
  getSortedCurrencyWallets,
  nativeToDenominated,
} from '../utils'
import { useInvalidateQueries } from './useInvalidateQueries'
import { useDisplayDenomination } from '.'

export const useEdgeAccountTotal = (account: EdgeAccount) => {
  const wallets = getSortedCurrencyWallets(account)
  const fiatCurrencyCode = useDefaultFiatCurrencyCode(account)[0]
  const displayDenomination = useDisplayDenomination(account, fiatCurrencyCode)[0]

  const getTotal = () =>
    Promise.all(
      wallets.map(({ balances }) =>
        Promise.all(
          Object.entries(balances).map(([currencyCode, nativeAmount]) => {
            const exchangeDenomination = getExchangeDenomination(account, currencyCode)
            const exchangeAmount = nativeToDenominated({
              nativeAmount: nativeAmount || String(0),
              denomination: exchangeDenomination,
            })

            return account.rateCache.convertCurrency(currencyCode, fiatCurrencyCode, Number(exchangeAmount))
          }),
        ),
      ),
    ).then((balances) => balances.flat().reduce((result, current) => result + current, 0))

  const { data, refetch } = useQuery({
    queryKey: [account.username, 'accountTotal'],
    queryFn: () => getTotal(),
    refetchInterval: 1000,
  })

  React.useEffect(() => {
    const unsub = account.rateCache.on('update', () => refetch())

    return () => {
      unsub()
    }
  })

  return { total: data!, denomination: displayDenomination }
}

export const useChangeWalletStates = (account: EdgeAccount) => {
  const {
    mutate: changeWalletStates,
    ...rest
  } = useMutation(({ walletId, walletState }: { walletId: string; walletState: EdgeWalletState }) =>
    account.changeWalletStates({ [walletId]: walletState }),
  )

  return {
    activateWallet: React.useCallback(
      (walletId: string) => changeWalletStates({ walletId, walletState: { archived: false, deleted: false } }),
      [changeWalletStates],
    ),
    archiveWallet: React.useCallback(
      (walletId: string) => changeWalletStates({ walletId, walletState: { archived: true, deleted: false } }),
      [changeWalletStates],
    ),
    deleteWallet: React.useCallback(
      (walletId: string) => changeWalletStates({ walletId, walletState: { archived: false, deleted: true } }),
      [changeWalletStates],
    ),
    ...rest,
  }
}

export const useCreateCurrencyWallet = (account: EdgeAccount) => {
  const mutationFn = ({ type, options }: { type: string; options: EdgeCreateCurrencyWalletOptions }) =>
    account.createCurrencyWallet(type, options)

  return useMutation(mutationFn)
}

export const useReadDefaultFiatCurrencyCode = (account: EdgeAccount, queryOptions?: UseQueryOptions<string>) => {
  const defaultFiatCurrencyCode = 'iso:USD'

  return useQuery({
    queryKey: [account.username, 'defaultFiatCurrencyCode'],
    queryFn: () =>
      account.dataStore
        .getItem('defaultFiatCurrencyCode', 'defaultFiatCurrencyCode.json')
        .then(JSON.parse)
        .catch(() => defaultFiatCurrencyCode) as Promise<string>,
    ...queryOptions,
  })
}

export const useWriteDefaultFiatCurrencyCode = (account: EdgeAccount) => {
  const queryFn = (currencyCode: string) =>
    account.dataStore.setItem('defaultFiatCurrencyCode', 'defaultFiatCurrencyCode.json', JSON.stringify(currencyCode))

  return useMutation(queryFn, {
    ...useInvalidateQueries([[account.username, 'defaultFiatCurrencyCode']]),
  })
}

export const useDefaultFiatCurrencyCode = (account: EdgeAccount) => {
  return [useReadDefaultFiatCurrencyCode(account).data!, useWriteDefaultFiatCurrencyCode(account).mutate] as const
}

export const useDefaultFiatInfo = (account: EdgeAccount) => {
  const [currencyCode] = useDefaultFiatCurrencyCode(account)

  return getFiatInfo(currencyCode)
}

export const useActiveInfos = (account: EdgeAccount) => {
  const queryFn = () => getActiveInfos(account)
  const queryKey = 'activeInfos'
  const { refetch, data } = useQuery(queryKey, queryFn, { suspense: true })

  React.useEffect(() => {
    const unsub = account.watch('currencyWallets', () => refetch())

    return () => {
      unsub()
    }
  }, [account, refetch])

  return data!
}

export const useEdgeCurrencyWallet = (
  { account, walletId }: { account: EdgeAccount; walletId: string; watch?: readonly (keyof EdgeCurrencyWallet)[] },
  queryOptions?: UseQueryOptions<EdgeCurrencyWallet>,
) => {
  const { data: wallet } = useQuery({
    queryKey: [walletId, 'wallet'],
    queryFn: () => account.waitForCurrencyWallet(walletId),
    ...queryOptions,
  })

  if (!wallet) throw new Error(`404: wallet:${walletId} not found`)

  return wallet
}

export const useOnRateChange = (account: EdgeAccount, callback: () => any) => {
  React.useEffect(() => {
    const unsub = account.rateCache.on('update', () => callback())

    return () => {
      unsub()
    }
  }, [account.rateCache, callback])
}
