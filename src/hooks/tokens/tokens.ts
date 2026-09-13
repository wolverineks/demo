import { EdgeCurrencyWallet, EdgeTokenInfo } from 'edge-core-js'
import { UseQueryOptions, useMutation, useQuery, useQueryClient } from 'react-query'

import {
  MetaTokenMap,
  addCustomToken,
  disableTokenCurrencyCode,
  enableTokenCurrencyCode,
  readCustomTokenInfos,
  readEnabledTokenCurrencyCodes,
  removeCustomToken,
  toCurrencyCodeMap,
} from './utils'
import { useInvalidateQueries } from '..'

const getIncludedInfos = (wallet: EdgeCurrencyWallet) => {
  return toCurrencyCodeMap(wallet.currencyInfo.metaTokens)
}

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
        .then(() => wallet.addCustomToken(tokenInfo))
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
        .then(() => wallet.disableTokens([currencyCode]))
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

const useEnableToken = (wallet: EdgeCurrencyWallet) => {
  const tokenInfos = getIncludedInfos(wallet)
  const customTokenInfos = useCustomInfos(wallet).data!

  const enableToken = async (tokenCurrencyCode: string) => {
    if (!tokenInfos[tokenCurrencyCode] && !customTokenInfos[tokenCurrencyCode])
      throw new Error(`Invalid Currency Code: ${tokenCurrencyCode}`)

    await enableTokenCurrencyCode(wallet, tokenCurrencyCode)

    return wallet.enableTokens([tokenCurrencyCode])
  }

  return useMutation(enableToken, {
    useErrorBoundary: true,
    ...useInvalidateQueries([['activeCurrencyCodes'], [wallet.id, 'enabledTokenCurrencyCodes']]),
  })
}

const useDisableToken = (wallet: EdgeCurrencyWallet) => {
  const disableToken = async (tokenCurrencyCode: string) => {
    return disableTokenCurrencyCode(wallet, tokenCurrencyCode).then(() => wallet.disableTokens([tokenCurrencyCode]))
  }

  return useMutation(disableToken, {
    ...useInvalidateQueries([['activeCurrencyCodes'], [wallet.id, 'enabledTokenCurrencyCodes']]),
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

export const useTokens = (wallet: EdgeCurrencyWallet) => ({
  includedInfos: getIncludedInfos(wallet),
  customTokenInfos: useCustomInfos(wallet).data!,
  addCustomInfo: useAddCustomInfo(wallet).mutate,
  removeCustomInfo: useRemoveCustomInfo(wallet).mutate,
  enabled: useEnabledTokenCurrencyCodes(wallet).data!,
  enable: useEnableToken(wallet).mutate,
  disable: useDisableToken(wallet).mutate,
})
