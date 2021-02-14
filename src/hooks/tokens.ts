import { EdgeCurrencyWallet, EdgeMetaToken, EdgeTokenInfo } from 'edge-core-js'
import * as React from 'react'
import { UseQueryOptions, useMutation, useQuery } from 'react-query'

import { useInvalidateQueries } from './useInvalidateQueries'

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

  return useMutation(queryFn, {
    ...useInvalidateQueries([['activeCurrencyCodes'], [wallet.id, 'enabledTokens']]),
  }).mutate
}

export const useDisableToken = (wallet: EdgeCurrencyWallet) => {
  const queryFn = (tokenCurrencyCode: string) => wallet.disableTokens([tokenCurrencyCode])

  return useMutation(queryFn, {
    ...useInvalidateQueries([['activeCurrencyCodes'], [wallet.id, 'enabledTokens']]),
  }).mutate
}

export const useTokens = (wallet: EdgeCurrencyWallet) => {
  return {
    enabledTokens: useEnabledTokens(wallet),
    enableToken: useEnableToken(wallet),
    disableToken: useDisableToken(wallet),
    tokenInfos: wallet.currencyInfo.metaTokens,
    customTokenInfos: useCustomTokens(wallet),
  }
}

type MetaTokenMap = { [currencyCode: string]: EdgeMetaToken }

export const getCustomTokenInfos = (wallet: EdgeCurrencyWallet): Promise<MetaTokenMap> => {
  return wallet.disklet
    .getText('customTokens')
    .then((text: string) => JSON.parse(text) as MetaTokenMap)
    .catch(() => ({}))
}

export const getCustomTokenInfo = (wallet: EdgeCurrencyWallet, currencyCode: string): Promise<EdgeMetaToken> => {
  return getCustomTokenInfos(wallet).then((tokenInfos) => tokenInfos[currencyCode])
}

export const useReadCustomTokens = (wallet: EdgeCurrencyWallet) => {
  return useQuery<MetaTokenMap>([wallet.id, 'customTokens'], () => getCustomTokenInfos(wallet))
}

export const useWriteCustomTokens = (wallet: EdgeCurrencyWallet) => {
  const mutationFn = (customTokens: MetaTokenMap) =>
    wallet.disklet.setText('customTokens', JSON.stringify(customTokens))

  return useMutation(mutationFn, {
    ...useInvalidateQueries([[wallet.id, 'customTokens']]),
  })
}

export const useCustomTokens = (wallet: EdgeCurrencyWallet) => {
  const all = useReadCustomTokens(wallet).data!
  const write = useWriteCustomTokens(wallet)
  const add = async (tokenInfo: EdgeTokenInfo) => {
    const metatoken = {
      ...tokenInfo,
      denominations: [{ name: tokenInfo.currencyName, multiplier: tokenInfo.multiplier }],
      symbolImage: '',
      addressExplorer: wallet.currencyInfo.addressExplorer,
      blockExplorer: wallet.currencyInfo.blockExplorer,
      transactionExplorer: wallet.currencyInfo.transactionExplorer,
      xpubExplorer: wallet.currencyInfo.xpubExplorer,
    }

    return write.mutateAsync({
      ...all,
      [metatoken.currencyCode]: metatoken,
    })
  }

  const update = async (metaToken: Partial<EdgeMetaToken> & { currencyCode: string }) => {
    return write.mutateAsync({
      ...all,
      [metaToken.currencyCode]: { ...all[metaToken.currencyCode], ...metaToken },
    })
  }

  return {
    all: Object.values(all),
    add: React.useCallback(add, [
      all,
      wallet.currencyInfo.addressExplorer,
      wallet.currencyInfo.blockExplorer,
      wallet.currencyInfo.transactionExplorer,
      wallet.currencyInfo.xpubExplorer,
      write,
    ]),
    update: React.useCallback(update, [all, write]),
  }
}
