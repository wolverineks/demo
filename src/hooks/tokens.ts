import { EdgeAccount, EdgeCurrencyWallet } from 'edge-core-js'
import { UseQueryOptions, useMutation, useQuery, useQueryClient } from 'react-query'

import { getAvailableTokens, getTokenInfo } from '../utils'
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
    ...useInvalidateQueries([['activeInfos'], [wallet.id, 'enabledTokens']]),
  }).mutate
}

export const useDisableToken = (wallet: EdgeCurrencyWallet) => {
  const queryFn = (tokenCurrencyCode: string) => wallet.disableTokens([tokenCurrencyCode])

  return useMutation(queryFn, {
    ...useInvalidateQueries([[wallet.id, 'enabledTokens'], ['activeInfos']]),
  }).mutate
}

export const useTokens = (account: EdgeAccount, wallet: EdgeCurrencyWallet) => ({
  availableTokens: getAvailableTokens(wallet),
  enabledTokens: useEnabledTokens(wallet),
  enableToken: useEnableToken(wallet),
  disableToken: useDisableToken(wallet),
  availableTokenInfos: getAvailableTokens(wallet).map((token) => getTokenInfo(account, token)),
})
