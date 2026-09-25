import {
  EdgeAccount,
  EdgeCreateCurrencyWalletOptions,
  EdgeCurrencyWallet,
  EdgeSwapQuote,
  EdgeSwapRequest,
  EdgeSwapResult,
  EdgeTokenId,
} from 'edge-core-js'
import React from 'react'
import { UseMutationOptions, UseQueryOptions, useMutation, useQuery } from 'react-query'

import { useEdgeAccount } from '../auth'
import { getWalletListMeta } from '../utils'
import { walletTransactionQueryKeys } from './edgeCurrencyWallet'
import { convertCurrency } from './rates'
import { getCryptoInfo, getCurrencyCodeFromTokenId, getFiatInfo } from './useInfo'
import { useInvalidateQueries } from './useInvalidateQueries'
import { useWatch } from './watch'
import { getExchangeDenomination, nativeToDenominated, useDisplayDenomination } from '.'

export const useUsername = () => {
  const account = useEdgeAccount()
  useWatch(account, 'username')

  return account.username ?? ''
}

export const useActiveWalletIds = () => {
  const account = useEdgeAccount()
  useWatch(account, 'activeWalletIds')

  return account.activeWalletIds
}

export const useArchivedWalletIds = () => {
  const account = useEdgeAccount()
  useWatch(account, 'archivedWalletIds')

  return account.archivedWalletIds
}

export const useDeletedWalletIds = () => {
  const account = useEdgeAccount()
  useWatch(account, 'allKeys')

  return account.allKeys.filter(({ deleted }) => deleted).map(({ id }) => id)
}

export const useCurrencyWallets = () => {
  const account = useEdgeAccount()
  useWatch(account, 'currencyWallets')

  return account.currencyWallets
}

export type TokenChoice = {
  key: string
  walletId: string
  tokenId: EdgeTokenId
  label: string
}

export const tokenChoiceKey = (walletId: string, tokenId: EdgeTokenId) => `${walletId}::${tokenId ?? 'native'}`

export const useTokenChoices = (): TokenChoice[] => {
  const account = useEdgeAccount()
  const activeWalletIds = useActiveWalletIds()
  useCurrencyWallets()

  return activeWalletIds.flatMap((walletId) => {
    const meta = getWalletListMeta(account, walletId)
    const wallet = account.currencyWallets[walletId]
    const walletLabel = wallet?.name || meta.name
    const native = {
      key: tokenChoiceKey(walletId, null),
      walletId,
      tokenId: null as EdgeTokenId,
      label: walletLabel,
    }
    if (!wallet) return [native]

    return [
      native,
      ...wallet.enabledTokenIds.map((tokenId) => ({
        key: tokenChoiceKey(walletId, tokenId),
        walletId,
        tokenId,
        label: `${walletLabel} · ${getCurrencyCodeFromTokenId(account, wallet.currencyInfo.pluginId, tokenId)}`,
      })),
    ]
  })
}

export const useEdgeAccountTotal = () => {
  const account = useEdgeAccount()
  const fiatCurrencyCode = useDefaultFiatCurrencyCode()[0]
  const [displayDenomination] = useDisplayDenomination(getFiatInfo(fiatCurrencyCode))

  const getTotal = async () => {
    const parts = await Promise.all(
      Object.values(account.currencyWallets).flatMap((wallet) =>
        Array.from(wallet.balanceMap.entries()).map(async ([tokenId, nativeAmount]) => {
          const currencyCode = getCurrencyCodeFromTokenId(account, wallet.currencyInfo.pluginId, tokenId)
          const info = getCryptoInfo(account, wallet.currencyInfo.pluginId, tokenId)
          if (!info) return 0

          const exchangeAmount = nativeToDenominated({
            nativeAmount: nativeAmount || String(0),
            denomination: getExchangeDenomination(info),
          })

          return convertCurrency(currencyCode, fiatCurrencyCode, Number(exchangeAmount))
        }),
      ),
    )

    return parts.reduce((total, amount) => total + amount, 0)
  }

  const { data } = useQuery({
    queryKey: [account.username, 'accountTotal'],
    queryFn: () => getTotal(),
    refetchInterval: 30_000,
  })

  return { total: data!, denomination: displayDenomination }
}

const toActive = (walletId: string) => ({ [walletId]: { archived: false, deleted: false } })
const toArchived = (walletId: string) => ({ [walletId]: { archived: true, deleted: false } })
const toDeleted = (walletId: string) => ({ [walletId]: { archived: false, deleted: true } })

export const useChangeWalletState = (walletId: string) => {
  const account = useEdgeAccount()
  const { mutate: changeWalletStates, ...rest } = useMutation(account.changeWalletStates)

  const activateWallet = React.useCallback(() => changeWalletStates(toActive(walletId)), [changeWalletStates, walletId])
  const archiveWallet = React.useCallback(
    () => changeWalletStates(toArchived(walletId)),
    [changeWalletStates, walletId],
  )
  const deleteWallet = React.useCallback(() => changeWalletStates(toDeleted(walletId)), [changeWalletStates, walletId])

  return {
    activateWallet,
    archiveWallet,
    deleteWallet,
    ...rest,
  }
}

export const useSortWallets = () => {
  const account = useEdgeAccount()
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

export const useCreateCurrencyWallet = (
  mutationOptions?: UseMutationOptions<
    EdgeCurrencyWallet,
    Error,
    { type: string; options: EdgeCreateCurrencyWalletOptions }
  >,
) => {
  const account = useEdgeAccount()
  const mutationFn = ({ type, options }: { type: string; options: EdgeCreateCurrencyWalletOptions }) =>
    account.createCurrencyWallet(type, options)

  return useMutation<EdgeCurrencyWallet, Error, { type: string; options: EdgeCreateCurrencyWalletOptions }>(
    mutationFn,
    mutationOptions,
  )
}

export const getDefaultFiatCurrencyCode = (account: EdgeAccount) => {
  const defaultFiatCurrencyCode = 'iso:USD'

  return account.dataStore
    .getItem('defaultFiatCurrencyCode', 'defaultFiatCurrencyCode.json')
    .then(JSON.parse)
    .catch(() => defaultFiatCurrencyCode) as Promise<string>
}

export const useReadDefaultFiatCurrencyCode = (queryOptions?: UseQueryOptions<string>) => {
  const account = useEdgeAccount()

  return useQuery({
    queryKey: [account.username, 'defaultFiatCurrencyCode'],
    queryFn: () => getDefaultFiatCurrencyCode(account),
    ...queryOptions,
  })
}

export const useWriteDefaultFiatCurrencyCode = () => {
  const account = useEdgeAccount()
  const queryFn = (currencyCode: string) =>
    account.dataStore.setItem('defaultFiatCurrencyCode', 'defaultFiatCurrencyCode.json', JSON.stringify(currencyCode))

  return useMutation(queryFn, {
    ...useInvalidateQueries([[account.username, 'defaultFiatCurrencyCode']]),
  })
}

export const useDefaultFiatCurrencyCode = () => {
  return [useReadDefaultFiatCurrencyCode().data!, useWriteDefaultFiatCurrencyCode().mutate] as const
}

export const useDefaultFiatInfo = () => {
  const [currencyCode] = useDefaultFiatCurrencyCode()

  return getFiatInfo(currencyCode)
}

export const useEdgeCurrencyWallet = (
  { walletId }: { walletId: string },
  queryOptions?: UseQueryOptions<EdgeCurrencyWallet>,
) => {
  const account = useEdgeAccount()
  const { data: wallet } = useQuery({
    queryKey: [walletId, 'wallet'],
    queryFn: () => account.waitForCurrencyWallet(walletId),
    cacheTime: 5 * 60 * 1000,
    staleTime: Infinity,
    ...queryOptions,
  })

  if (!wallet) throw new Error(`404: wallet:${walletId} not found`)

  return wallet
}

export const useSwapQuote = ({
  nativeAmount,
  fromWallet,
  fromTokenId,
  toWallet,
  toTokenId,
}: {
  nativeAmount: string
  fromWallet: EdgeCurrencyWallet
  fromTokenId: EdgeTokenId
  toWallet: EdgeCurrencyWallet | undefined
  toTokenId: EdgeTokenId | undefined
}) => {
  const account = useEdgeAccount()
  const hasAmount = Number(nativeAmount) > 0
  const swapRequest: EdgeSwapRequest | undefined =
    toWallet && toTokenId !== undefined && hasAmount
      ? {
          fromWallet,
          toWallet,
          fromTokenId,
          toTokenId,
          nativeAmount,
          quoteFor: 'from',
        }
      : undefined

  const { data: swapQuote, ...rest } = useQuery<EdgeSwapQuote, Error>(
    [
      {
        nativeAmount,
        fromWalletId: fromWallet.id,
        fromTokenId,
        toWalletId: toWallet?.id,
        toTokenId,
        quoteFor: 'from',
      },
    ],
    () => account.fetchSwapQuote(swapRequest as EdgeSwapRequest),
    { enabled: !!swapRequest, useErrorBoundary: false, suspense: false, cacheTime: 0 },
  )

  return {
    swapQuote,
    ...rest,
  }
}

export const useApproveSwapQuote = (
  wallet: EdgeCurrencyWallet,
  mutationOptions?: UseMutationOptions<EdgeSwapResult, Error, EdgeSwapQuote>,
) => {
  return useMutation((quote: EdgeSwapQuote) => quote.approve(), {
    ...useInvalidateQueries(walletTransactionQueryKeys(wallet)),
    ...mutationOptions,
  })
}

export const useSplitWallet = (walletId: string) => {
  const account = useEdgeAccount()
  const enabledTypes = new Set(Object.values(account.currencyConfig).map(({ currencyInfo }) => currencyInfo.walletType))

  return {
    walletTypes: (
      useQuery({
        queryKey: [walletId, 'splittableWalletTypes'],
        queryFn: () => account.listSplittableWalletTypes(walletId),
      }).data ?? []
    ).filter((walletType) => enabledTypes.has(walletType)),
    splitWallet: useMutation(
      async (walletType: string) => {
        const wallet = await account.waitForCurrencyWallet(walletId)
        const [result] = await wallet.split([{ walletType }])
        if (result == null) throw new Error('Wallet split failed')
        if (!result.ok) throw result.error instanceof Error ? result.error : new Error(String(result.error))

        return result.result
      },
      {
        ...useInvalidateQueries([[walletId, 'splittableWalletTypes']]),
      },
    ).mutateAsync,
  }
}
