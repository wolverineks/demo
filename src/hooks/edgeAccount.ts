import {
  EdgeAccount,
  EdgeCreateCurrencyWalletOptions,
  EdgeCurrencyWallet,
  EdgeSwapQuote,
  EdgeSwapRequest,
} from 'edge-core-js'
import React from 'react'
import { UseQueryOptions, useMutation, useQuery } from 'react-query'

import { getCustomTokenInfo } from './tokens'
import { getFiatInfo, getInfo } from './useInfo'
import { useInvalidateQueries } from './useInvalidateQueries'
import { useWatch } from './watch'
import { getExchangeDenomination, nativeToDenominated, useDisplayDenomination } from '.'

export const useUsername = (account: EdgeAccount) => {
  useWatch(account, 'username')

  return account.username
}

export const useActiveWalletIds = (account: EdgeAccount) => {
  useWatch(account, 'activeWalletIds')

  return account.activeWalletIds
}

export const useArchivedWalletIds = (account: EdgeAccount) => {
  useWatch(account, 'archivedWalletIds')

  return account.archivedWalletIds
}

export const useDeletedWalletIds = (account: EdgeAccount) => {
  useWatch(account, 'allKeys')

  return account.allKeys.filter(({ deleted }) => deleted).map(({ id }) => id)
}

export const useCurrencyWallets = (account: EdgeAccount) => {
  useWatch(account, 'currencyWallets')

  return account.currencyWallets
}

export const useEdgeAccountTotal = (account: EdgeAccount) => {
  const fiatCurrencyCode = useDefaultFiatCurrencyCode(account)[0]
  const displayDenomination = useDisplayDenomination(account, fiatCurrencyCode)[0]

  const getTotal = async () => {
    let total = 0

    for (const wallet of Object.values(account.currencyWallets)) {
      for (const [currencyCode, nativeAmount] of Object.entries(wallet.balances)) {
        const info = getInfo(account, currencyCode) || (await getCustomTokenInfo(wallet, currencyCode))
        const exchangeDenomination = getExchangeDenomination(info)
        const exchangeAmount = nativeToDenominated({
          nativeAmount: nativeAmount || String(0),
          denomination: exchangeDenomination,
        })

        total += await account.rateCache.convertCurrency(currencyCode, fiatCurrencyCode, Number(exchangeAmount))
      }
    }

    return total
  }

  const { data, refetch } = useQuery({
    queryKey: [account.username, 'accountTotal'],
    queryFn: () => getTotal(),
  })

  useOnRateChange(account, () => refetch())

  return { total: data!, denomination: displayDenomination }
}

const toActive = (walletId: string) => ({ [walletId]: { archived: false, deleted: false } })
const toArchived = (walletId: string) => ({ [walletId]: { archived: true, deleted: false } })
const toDeleted = (walletId: string) => ({ [walletId]: { archived: false, deleted: true } })

export const useChangeWalletState = (account: EdgeAccount, walletId: string) => {
  const { mutate: changeWalletStates, ...rest } = useMutation(account.changeWalletStates)

  const activateWallet = React.useCallback(() => changeWalletStates(toActive(walletId)), [changeWalletStates, walletId])
  const archiveWallet = React.useCallback(() => changeWalletStates(toArchived(walletId)), [
    changeWalletStates,
    walletId,
  ])
  const deleteWallet = React.useCallback(() => changeWalletStates(toDeleted(walletId)), [changeWalletStates, walletId])

  return {
    activateWallet,
    archiveWallet,
    deleteWallet,
    ...rest,
  }
}

export const useSortWallets = (account: EdgeAccount) => {
  const { mutate: changeWalletStates } = useMutation(account.changeWalletStates)

  return React.useCallback(
    (walletIds: string[]) =>
      changeWalletStates(
        walletIds.reduce(
          (result, walletId, index) => ({
            ...result,
            [walletId]: { sortIndex: index },
          }),
          {},
        ),
      ),
    [changeWalletStates],
  )
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

export const useEdgeCurrencyWallet = (
  { account, walletId }: { account: EdgeAccount; walletId: string },
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

export const useSwapQuote = ({
  account,
  nativeAmount,
  fromWallet,
  fromCurrencyCode,
  toWallet,
  toCurrencyCode,
}: {
  account: EdgeAccount
  nativeAmount: string
  fromWallet: EdgeCurrencyWallet
  fromCurrencyCode: string
  toWallet: EdgeCurrencyWallet | undefined
  toCurrencyCode: string | undefined
}) => {
  const swapRequest = {
    fromWallet,
    fromCurrencyCode,
    nativeAmount,

    quoteFor: 'to',

    toWallet,
    toCurrencyCode,
  } as EdgeSwapRequest

  const { data: swapQuote, ...rest } = useQuery<EdgeSwapQuote, Error>(
    [
      {
        nativeAmount,
        fromWalletId: fromWallet.id,
        fromCurrencyCode,
        toWalletId: toWallet?.id,
        toCurrencyCode,
      },
    ],
    () => account.fetchSwapQuote(swapRequest as EdgeSwapRequest),
    { enabled: !!toWallet && !!toCurrencyCode, useErrorBoundary: false, suspense: false, cacheTime: 0 },
  )

  return {
    swapQuote,
    ...rest,
  }
}
