import {
  EdgeCurrencyCodeOptions,
  EdgeCurrencyWallet,
  EdgeGetTransactionsOptions,
  EdgeParsedUri,
  EdgeReceiveAddress,
  EdgeSpendInfo,
  EdgeTransaction,
} from 'edge-core-js'
import React from 'react'
import { UseQueryOptions, useMutation, useQuery } from 'react-query'

import { useInvalidateQueries } from './useInvalidateQueries'
import { useWatch } from './watch'

export const useSyncRatio = (wallet: EdgeCurrencyWallet) => {
  useWatch(wallet, 'syncRatio')

  return wallet.syncRatio
}

export const useBalance = (wallet: EdgeCurrencyWallet, currencyCode: string) => {
  const waitForBalance = (wallet: EdgeCurrencyWallet): Promise<string> => {
    return wallet.balances[currencyCode] != null
      ? Promise.resolve(wallet.balances[currencyCode])
      : new Promise((resolve) => {
          const unsubscribe = wallet.watch('balances', (balances) => {
            if (balances[currencyCode] != null) {
              unsubscribe()
              resolve(balances[currencyCode])
            }
          })
        })
  }

  const { refetch, data } = useQuery({
    queryKey: [wallet.id, 'balance', currencyCode],
    queryFn: () => waitForBalance(wallet),
    enabled: !!wallet,
  })

  useWatch(wallet, 'balances', () => refetch())

  return data!
}

export const useWriteFiatCurrencyCode = (wallet: EdgeCurrencyWallet) => {
  return useMutation(wallet.setFiatCurrencyCode)
}

export const useFiatCurrencyCode = (wallet: EdgeCurrencyWallet) => {
  useWatch(wallet, 'fiatCurrencyCode')

  return [wallet.fiatCurrencyCode, useWriteFiatCurrencyCode(wallet).mutate] as const
}

export const useRenameWallet = (wallet: EdgeCurrencyWallet) => {
  const mutationFn = ({ name }: { name: string }) => wallet.renameWallet(name)

  return useMutation(mutationFn, {
    ...useInvalidateQueries([[wallet.id, 'disklet', 'WalletName.json']]), // invalidate dataStore
  })
}

export const useName = (wallet: EdgeCurrencyWallet) => {
  useWatch(wallet, 'name')

  return [wallet.name, useRenameWallet(wallet).mutate] as const
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

const dedupe = (transactions: EdgeTransaction[]) =>
  Object.values<EdgeTransaction>(
    transactions.reduce((result, transaction) => ({ ...result, [transaction.txid]: transaction }), {}),
  )

export const useTransactions = (
  wallet: EdgeCurrencyWallet,
  options?: EdgeGetTransactionsOptions,
  queryOptions?: UseQueryOptions<EdgeTransaction[]>,
) => {
  const { data, refetch } = useQuery({
    queryKey: [wallet.id, 'transactions', options],
    queryFn: () => wallet.getTransactions(options),
    suspense: true,
    ...queryOptions,
  })

  useOnNewTransactions(
    wallet,
    React.useCallback(() => refetch(), [refetch]),
  )

  return dedupe(data!)
}

export const useParsedUri = (wallet: EdgeCurrencyWallet, uri?: string, options?: UseQueryOptions<EdgeParsedUri>) => {
  return useQuery([wallet.id, uri], () => wallet.parseUri(uri!), {
    suspense: false,
    ...options,
  }).data
}

export const useClipboardUri = (wallet: EdgeCurrencyWallet, queryOptions?: UseQueryOptions<string | undefined>) => {
  const queryKey = [wallet.id, 'clipboardUri']
  const queryFn = () =>
    navigator.clipboard.readText().then((clipboard) => wallet.parseUri(clipboard).then(() => clipboard))

  const { data: clipboardUri } = useQuery(queryKey, queryFn, {
    suspense: false,
    useErrorBoundary: false,
    ...queryOptions,
  } as UseQueryOptions<string | undefined>)

  return clipboardUri
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
  }).data!
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

export const useExportTransactions = (
  wallet: EdgeCurrencyWallet,
  options: EdgeGetTransactionsOptions,
  format: 'CSV' | 'QBO',
) => {
  return useQuery([wallet.id, 'export-transaction', options, format], () =>
    format === 'CSV' ? wallet.exportTransactionsToCSV(options) : wallet.exportTransactionsToQBO(options),
  )
}
