import {
  EdgeAddress,
  EdgeCurrencyWallet,
  EdgeGetTransactionsOptions,
  EdgeParsedUri,
  EdgeSpendInfo,
  EdgeTokenId,
  EdgeTransaction,
} from 'edge-core-js'
import React from 'react'
import { UseMutationOptions, UseQueryOptions, useMutation, useQuery } from 'react-query'

import { getCurrencyCodeFromTokenId, getNativeBalance, getPublicAddress, getTokenId } from '../utils'
import { useInvalidateQueries } from './useInvalidateQueries'
import { useWatch } from './watch'

export const useSyncRatio = (wallet: EdgeCurrencyWallet) => {
  useWatch(wallet, 'syncStatus')

  return wallet.syncStatus.totalRatio
}

export const useBalance = (wallet: EdgeCurrencyWallet, currencyCode: string) => {
  useWatch(wallet, 'balanceMap')

  return getNativeBalance(wallet, getTokenId(wallet, currencyCode))
}

export const useWriteFiatCurrencyCode = (wallet: EdgeCurrencyWallet) => {
  return useMutation(wallet.setFiatCurrencyCode, {
    ...useInvalidateQueries([['walletFiatCurrencyCodes']]),
  })
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
  options?: { currencyCode?: string; tokenId?: EdgeTokenId }
  queryOptions?: UseQueryOptions<{ publicAddress: string; addresses: EdgeAddress[]; uri: string }>
}) => {
  return useQuery({
    queryKey: [wallet.id, 'receiveAddressAndEncodeUri', nativeAmount, options],
    queryFn: async () => {
      const tokenId = options?.tokenId ?? getTokenId(wallet, options?.currencyCode)
      const addresses = await wallet.getAddresses({ tokenId })
      const publicAddress = getPublicAddress(addresses)
      if (!publicAddress) throw new Error('No receive address')
      const uri = await wallet.encodeUri({
        publicAddress,
        nativeAmount: nativeAmount || '0',
      })

      return { publicAddress, addresses, uri }
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
  options?: Partial<EdgeGetTransactionsOptions> & { currencyCode?: string },
  queryOptions?: UseQueryOptions<EdgeTransaction[]>,
) => {
  const txOptions = toTransactionOptions(wallet, options)
  const { data, refetch } = useQuery({
    queryKey: [wallet.id, 'transactions', txOptions],
    queryFn: () => wallet.getTransactions(txOptions),
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
  return useQuery({
    queryKey: [wallet.id, uri],
    queryFn: () => wallet.parseUri(uri!),
    suspense: false,
    ...options,
  }).data
}

export const useClipboardUri = (wallet: EdgeCurrencyWallet, queryOptions?: UseQueryOptions<string | undefined>) => {
  const queryKey = [wallet.id, 'clipboardUri']
  const queryFn = () =>
    navigator.clipboard.readText().then((clipboard) => wallet.parseUri(clipboard).then(() => clipboard))

  const { data: clipboardUri } = useQuery({
    queryKey,
    queryFn,
    suspense: false,
    useErrorBoundary: false,
    ...queryOptions,
  } as UseQueryOptions<string | undefined>)

  return clipboardUri
}

export const useTransactionCount = (
  wallet: EdgeCurrencyWallet,
  options?: Partial<EdgeGetTransactionsOptions> & { currencyCode?: string },
  queryOptions?: UseQueryOptions<number>,
) => {
  const txOptions = toTransactionOptions(wallet, options)
  const { data, refetch } = useQuery({
    queryKey: [wallet.id, 'transactionCount', txOptions],
    queryFn: () => wallet.getNumTransactions(txOptions),
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

export const walletTransactionQueryKeys = (wallet: EdgeCurrencyWallet) => [
  [wallet.id, 'transactions'],
  [wallet.id, 'transactionCount'],
  [wallet.id, 'maxSpendable'],
  [wallet.id, 'maxSpendableTransaction'],
  [wallet.id, 'transaction'],
]

export const useSignTx = (
  wallet: EdgeCurrencyWallet,
  mutationOptions?: UseMutationOptions<EdgeTransaction, Error, EdgeTransaction>,
) => {
  return useMutation((transaction: EdgeTransaction) => wallet.signTx(transaction), mutationOptions)
}

export const useBroadcastTx = (
  wallet: EdgeCurrencyWallet,
  mutationOptions?: UseMutationOptions<EdgeTransaction, Error, EdgeTransaction>,
) => {
  return useMutation((transaction: EdgeTransaction) => wallet.broadcastTx(transaction), mutationOptions)
}

export const useSaveTx = (
  wallet: EdgeCurrencyWallet,
  mutationOptions?: UseMutationOptions<void, Error, EdgeTransaction>,
) => {
  return useMutation((transaction: EdgeTransaction) => wallet.saveTx(transaction), {
    ...useInvalidateQueries(walletTransactionQueryKeys(wallet)),
    ...mutationOptions,
  })
}

export const useSignBroadcastAndSaveTx = (
  wallet: EdgeCurrencyWallet,
  mutationOptions?: UseMutationOptions<EdgeTransaction, Error, EdgeTransaction>,
) => {
  return useMutation(
    async (transaction: EdgeTransaction) => {
      const signed = await wallet.signTx(transaction)
      const broadcasted = await wallet.broadcastTx(signed)
      await wallet.saveTx(broadcasted)

      return broadcasted
    },
    {
      ...useInvalidateQueries(walletTransactionQueryKeys(wallet)),
      ...mutationOptions,
    },
  )
}

export const useExportTransactions = (
  wallet: EdgeCurrencyWallet,
  options: EdgeGetTransactionsOptions,
  format: 'CSV' | 'QBO',
) => {
  return useQuery({
    queryKey: [wallet.id, 'export-transaction', options, format],
    queryFn: async () => {
      // CSV/QBO helpers left the core in 0.18; dump txs as CSV from getTransactions.
      const transactions = await wallet.getTransactions(options)
      if (format === 'QBO') {
        throw new Error('QBO export was removed from edge-core-js in 0.18.0')
      }

      const header = 'txid,date,currencyCode,nativeAmount'
      const rows = transactions.map((tx) => {
        const currencyCode = getCurrencyCodeFromTokenId(wallet, tx.tokenId)

        return `${tx.txid},${tx.date},${currencyCode},${tx.nativeAmount}`
      })

      return [header, ...rows].join('\n')
    },
  })
}

const toTransactionOptions = (
  wallet: EdgeCurrencyWallet,
  options?: Partial<EdgeGetTransactionsOptions> & { currencyCode?: string },
): EdgeGetTransactionsOptions => {
  const { currencyCode, tokenId, ...rest } = options ?? {}

  return {
    ...rest,
    tokenId: tokenId !== undefined ? tokenId : getTokenId(wallet, currencyCode ?? wallet.currencyInfo.currencyCode),
  }
}
