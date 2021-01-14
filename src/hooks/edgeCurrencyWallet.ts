import {
  EdgeAccount,
  EdgeCurrencyCodeOptions,
  EdgeCurrencyWallet,
  EdgeGetTransactionsOptions,
  EdgeReceiveAddress,
  EdgeSpendInfo,
  EdgeTransaction,
} from 'edge-core-js'
import React from 'react'
import { UseQueryOptions, useMutation, useQuery, useQueryClient } from 'react-query'

import { getAvailableTokens, getTokenInfo } from '../utils'
import { useWatch } from './watch'

export const useOnNewTransactions = (
  wallet: EdgeCurrencyWallet,
  callback: (transactions: Array<EdgeTransaction>) => any,
) => {
  React.useEffect(() => {
    const unsubscribe = wallet.on('newTransactions', callback)

    return () => {
      unsubscribe()
    }
  }, [wallet, callback])
}

export const useBalance = (wallet: EdgeCurrencyWallet, currencyCode: string) => {
  const waitForBalance = (wallet: EdgeCurrencyWallet, code: string): Promise<string> => {
    return wallet.balances[code] != null
      ? Promise.resolve(wallet.balances[code])
      : new Promise((resolve) => {
          const unsubscribe = wallet.watch('balances', (balances) => {
            if (balances[code] != null) {
              unsubscribe()
              resolve(balances[code])
            }
          })
        })
  }

  const { refetch, data } = useQuery({
    queryKey: [wallet.id, 'balance', currencyCode],
    queryFn: () => waitForBalance(wallet, currencyCode),
    enabled: !!wallet,
  })

  useWatch(wallet, 'balances', () => refetch())

  return data!
}

export const useWriteFiatCurrencyCode = (wallet: EdgeCurrencyWallet) => {
  return useMutation(wallet.setFiatCurrencyCode)
}

export const useFiatCurrencyCode = (wallet: EdgeCurrencyWallet) => {
  return [wallet.fiatCurrencyCode, useWriteFiatCurrencyCode(wallet).mutate] as const
}

export const useRenameWallet = (wallet: EdgeCurrencyWallet) => {
  const queryClient = useQueryClient()
  const queryKey = [wallet.id, 'disklet', 'WalletName.json']
  const mutationFn = ({ name }: { name: string }) => wallet.renameWallet(name)

  return useMutation(mutationFn, {
    onMutate: () => queryClient.cancelQueries(queryKey), // invalidate dataStore
    onSettled: () => queryClient.invalidateQueries(queryKey), // invalidate dataStore
  })
}

export const useReceiveAddressAndEncodeUri = ({
  wallet,
  nativeAmount,
  options,
  queryOptions,
}: {
  wallet: EdgeCurrencyWallet
  nativeAmount: string
  options?: EdgeCurrencyCodeOptions
  queryOptions?: UseQueryOptions<{ receiveAddress: EdgeReceiveAddress; uri: string }>
}) => {
  return useQuery({
    queryKey: [wallet.id, 'receiveAddressAndEncodeUri', nativeAmount, options],
    queryFn: () => {
      const receiveAddress = wallet.getReceiveAddress({ currencyCode: options?.currencyCode })
      const uri = receiveAddress.then(({ publicAddress }) =>
        wallet.encodeUri({
          publicAddress,
          nativeAmount: nativeAmount || '0',
        }),
      )

      return Promise.all([receiveAddress, uri]).then(([receiveAddress, uri]) => ({ receiveAddress, uri }))
    },
    suspense: false,
    ...queryOptions,
  })
}

export const useEnabledTokens = (wallet: EdgeCurrencyWallet, queryOptions?: UseQueryOptions<string[]>) => {
  const queryFn = () =>
    wallet
      .getEnabledTokens()
      // WTF? Why is the parent currencyCode in enabledTokens?
      .then((tokens) => tokens.filter((tokenCode) => tokenCode !== wallet.currencyInfo.currencyCode))
  const queryKey = [wallet.id, 'enabledTokens']

  return useQuery(queryKey, queryFn, {
    suspense: true,
    ...queryOptions,
  }).data!
}

export const useEnableToken = (wallet: EdgeCurrencyWallet) => {
  const queryFn = (tokenCurrencyCode: string) => wallet.enableTokens([tokenCurrencyCode])
  const queryClient = useQueryClient()
  const queryKey = [wallet.id, 'enabledTokens']

  return useMutation(queryFn, {
    onMutate: () => queryClient.cancelQueries(queryKey),
    onSettled: () => {
      queryClient.invalidateQueries('activeInfos')
      queryClient.invalidateQueries(queryKey)
    },
  }).mutate
}

export const useDisableToken = (wallet: EdgeCurrencyWallet) => {
  const queryFn = (tokenCurrencyCode: string) => wallet.disableTokens([tokenCurrencyCode])
  const queryClient = useQueryClient()
  const queryKey = [wallet.id, 'enabledTokens']

  return useMutation(queryFn, {
    onMutate: () => queryClient.cancelQueries(queryKey),
    onSettled: () => {
      queryClient.invalidateQueries('activeInfos')
      queryClient.invalidateQueries(queryKey)
    },
  }).mutate
}

export const useTokens = (account: EdgeAccount, wallet: EdgeCurrencyWallet) => ({
  availableTokens: getAvailableTokens(wallet),
  enabledTokens: useEnabledTokens(wallet),
  enableToken: useEnableToken(wallet),
  disableToken: useDisableToken(wallet),
  availableTokenInfos: getAvailableTokens(wallet).map((token) => getTokenInfo(account, token)),
})

export const useTransactions = (
  wallet: EdgeCurrencyWallet,
  options?: EdgeGetTransactionsOptions,
  queryOptions?: UseQueryOptions<EdgeTransaction[]>,
) => {
  const { data, refetch } = useQuery({
    queryKey: [wallet.id, 'transactions', options],
    queryFn: () => wallet.getTransactions(options),
    ...queryOptions,
  })

  useOnNewTransactions(
    wallet,
    React.useCallback(() => refetch(), [refetch]),
  )

  return data!
}

export const useTransactionCount = (
  wallet: EdgeCurrencyWallet,
  options?: EdgeGetTransactionsOptions,
  queryOptions?: UseQueryOptions<number>,
) => {
  const { data, refetch } = useQuery({
    queryKey: [wallet.id, 'transactionCount', options],
    queryFn: () => wallet.getNumTransactions(options),
    suspense: false,
    ...queryOptions,
  })

  useOnNewTransactions(
    wallet,
    React.useCallback(() => refetch(), [refetch]),
  )

  return data!
}

export const useMaxSpendable = (
  wallet: EdgeCurrencyWallet,
  spendInfo: EdgeSpendInfo,
  queryOptions?: UseQueryOptions<string>,
) => {
  return useQuery({
    queryKey: [wallet.id, 'maxSpendable', spendInfo],
    queryFn: () => wallet.getMaxSpendable(spendInfo),
    suspense: false,
    ...queryOptions,
  })
}

export const useMaxTransaction = (
  wallet: EdgeCurrencyWallet,
  spendInfo: EdgeSpendInfo,
  queryOptions?: UseQueryOptions<EdgeTransaction>,
) => {
  return useQuery({
    queryKey: [wallet.id, 'maxSpendableTransaction', spendInfo],
    queryFn: async () => {
      const maxSpendable = await wallet.getMaxSpendable(spendInfo)
      const spendTargets = [{ ...spendInfo.spendTargets[0], nativeAmount: maxSpendable }]
      const maxSpendInfo = { ...spendInfo, spendTargets }

      return wallet.makeSpend(maxSpendInfo)
    },
    ...queryOptions,
  })
}

export const useNewTransaction = (
  wallet: EdgeCurrencyWallet,
  spendInfo: EdgeSpendInfo,
  queryOptions?: UseQueryOptions<EdgeTransaction>,
) => {
  return useQuery({
    queryKey: [wallet.id, 'transaction', spendInfo],
    queryFn: () => wallet.makeSpend(spendInfo),
    suspense: false,
    ...queryOptions,
  })
}
