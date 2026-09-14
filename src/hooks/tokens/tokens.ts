import { EdgeCurrencyWallet, EdgeTokenInfo } from 'edge-core-js'
import { UseQueryOptions, useMutation, useQuery, useQueryClient } from 'react-query'

import { getTokenId, unique } from '../../utils'
import {
  MetaTokenMap,
  addCustomToken,
  disableTokenCurrencyCode,
  enableTokenCurrencyCode,
  getIncludedInfos,
  readCustomTokenInfos,
  readEnabledTokenCurrencyCodes,
  removeCustomToken,
} from './utils'
import { useInvalidateQueries, useWatch } from '..'

const useCustomInfos = (wallet: EdgeCurrencyWallet) => {
  return useQuery<MetaTokenMap>({
    queryKey: [wallet.id, 'customTokenInfos'],
    queryFn: () => readCustomTokenInfos(wallet),
  })
}

const useAddCustomInfo = (wallet: EdgeCurrencyWallet) => {
  const queryClient = useQueryClient()

  return useMutation(
    (tokenInfo: EdgeTokenInfo) => {
      const metatoken = {
        ...tokenInfo,
        denominations: [{ name: tokenInfo.currencyName, multiplier: tokenInfo.multiplier }],
        symbolImage: '',
        addressExplorer: wallet.currencyInfo.addressExplorer,
        blockExplorer: wallet.currencyInfo.blockExplorer,
        transactionExplorer: wallet.currencyInfo.transactionExplorer,
        xpubExplorer: wallet.currencyInfo.xpubExplorer,
      }

      return addCustomToken(wallet, metatoken)
        .then(() => enableTokenCurrencyCode(wallet, metatoken.currencyCode))
        .then(async () => {
          const tokenId = await wallet.currencyConfig.addCustomToken({
            currencyCode: tokenInfo.currencyCode,
            displayName: tokenInfo.currencyName,
            denominations: [{ name: tokenInfo.currencyName, multiplier: tokenInfo.multiplier }],
            networkLocation: { contractAddress: tokenInfo.contractAddress },
          })
          await wallet.changeEnabledTokenIds([...wallet.enabledTokenIds, tokenId])
        })
        .then(() =>
          queryClient.invalidateQueries([
            ['info', tokenInfo.currencyCode],
            [tokenInfo.currencyCode, 'displayDenomination'],
            ['displayDenomination', tokenInfo.currencyCode],
          ]),
        )
    },
    {
      ...useInvalidateQueries([
        ['activeCurrencyCodes'],
        [wallet.id, 'enabledTokenCurrencyCodes'],
        [wallet.id, 'customTokenInfos'],
        ['info'],
      ]),
    },
  )
}

const useRemoveCustomInfo = (wallet: EdgeCurrencyWallet) => {
  return useMutation(
    (currencyCode: string) => {
      return disableTokenCurrencyCode(wallet, currencyCode)
        .then(() => removeCustomToken(wallet, currencyCode))
        .then(async () => {
          const tokenId = getTokenId(wallet, currencyCode)
          await wallet.changeEnabledTokenIds(wallet.enabledTokenIds.filter((id) => id !== tokenId))
          if (tokenId) await wallet.currencyConfig.removeCustomToken(tokenId)
        })
    },
    {
      ...useInvalidateQueries([
        ['activeCurrencyCodes'],
        [wallet.id, 'enabledTokenCurrencyCodes'],
        [wallet.id, 'customTokenInfos'],
      ]),
    },
  )
}

const enabledQueryKey = (wallet: EdgeCurrencyWallet) => [wallet.id, 'enabledTokenCurrencyCodes']

const useEnableToken = (wallet: EdgeCurrencyWallet) => {
  const queryClient = useQueryClient()
  const tokenInfos = getIncludedInfos(wallet)
  const customTokenInfos = useCustomInfos(wallet).data!

  const enableToken = async (tokenCurrencyCode: string) => {
    if (!tokenInfos[tokenCurrencyCode] && !customTokenInfos[tokenCurrencyCode])
      throw new Error(`Invalid Currency Code: ${tokenCurrencyCode}`)

    await enableTokenCurrencyCode(wallet, tokenCurrencyCode)
    const tokenId = getTokenId(wallet, tokenCurrencyCode)
    if (!tokenId) return
    await wallet.changeEnabledTokenIds([...wallet.enabledTokenIds, tokenId])
  }

  return useMutation(enableToken, {
    useErrorBoundary: true,
    onMutate: async (tokenCurrencyCode) => {
      const queryKey = enabledQueryKey(wallet)
      await queryClient.cancelQueries(queryKey)
      const previous = queryClient.getQueryData<string[]>(queryKey)
      queryClient.setQueryData(queryKey, unique([...(previous || []), tokenCurrencyCode]))

      return { previous }
    },
    onError: (_error, _code, context?: { previous?: string[] }) => {
      if (context?.previous) queryClient.setQueryData(enabledQueryKey(wallet), context.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries(enabledQueryKey(wallet))
      queryClient.invalidateQueries(['activeCurrencyCodes'])
    },
  })
}

const useDisableToken = (wallet: EdgeCurrencyWallet) => {
  const queryClient = useQueryClient()
  const disableToken = async (tokenCurrencyCode: string) => {
    return disableTokenCurrencyCode(wallet, tokenCurrencyCode).then(async () => {
      const tokenId = getTokenId(wallet, tokenCurrencyCode)
      await wallet.changeEnabledTokenIds(wallet.enabledTokenIds.filter((id) => id !== tokenId))
    })
  }

  return useMutation(disableToken, {
    onMutate: async (tokenCurrencyCode) => {
      const queryKey = enabledQueryKey(wallet)
      await queryClient.cancelQueries(queryKey)
      const previous = queryClient.getQueryData<string[]>(queryKey)
      queryClient.setQueryData(
        queryKey,
        (previous || []).filter((currencyCode) => currencyCode !== tokenCurrencyCode),
      )

      return { previous }
    },
    onError: (_error, _code, context?: { previous?: string[] }) => {
      if (context?.previous) queryClient.setQueryData(enabledQueryKey(wallet), context.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries(enabledQueryKey(wallet))
      queryClient.invalidateQueries(['activeCurrencyCodes'])
    },
  })
}

const useEnabledTokenCurrencyCodes = (wallet: EdgeCurrencyWallet, queryOptions?: UseQueryOptions<string[]>) => {
  const queryKey = [wallet.id, 'enabledTokenCurrencyCodes']

  return useQuery({
    queryKey,
    queryFn: () => readEnabledTokenCurrencyCodes(wallet),
    suspense: true,
    ...queryOptions,
  })
}

const enabledCodesFromEngine = (wallet: EdgeCurrencyWallet) =>
  wallet.enabledTokenIds
    .map((tokenId) => wallet.currencyConfig.allTokens[tokenId]?.currencyCode)
    .filter((currencyCode): currencyCode is string => {
      return !!currencyCode && currencyCode !== wallet.currencyInfo.currencyCode
    })

export const useTokens = (wallet: EdgeCurrencyWallet) => {
  useWatch(wallet, 'enabledTokenIds')
  useWatch(wallet.currencyConfig, 'allTokens')
  useWatch(wallet.currencyConfig, 'builtinTokens')

  return {
    includedInfos: getIncludedInfos(wallet),
    customTokenInfos: useCustomInfos(wallet).data!,
    addCustomInfo: useAddCustomInfo(wallet).mutate,
    removeCustomInfo: useRemoveCustomInfo(wallet).mutate,
    enabled: unique([...useEnabledTokenCurrencyCodes(wallet).data!, ...enabledCodesFromEngine(wallet)]),
    enable: useEnableToken(wallet).mutateAsync,
    disable: useDisableToken(wallet).mutate,
  }
}
