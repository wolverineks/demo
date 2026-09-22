import { EdgeCurrencyWallet, EdgeTokenInfo } from 'edge-core-js'
import { useMutation, useQueryClient } from 'react-query'

import { getIncludedTokenInfos, readCustomTokenInfos } from './utils'
import { useInvalidateQueries, useWatch } from '..'

const useCustomInfos = (wallet: EdgeCurrencyWallet) => {
  useWatch(wallet.currencyConfig, 'customTokens')

  return readCustomTokenInfos(wallet)
}

const useAddCustomInfo = (wallet: EdgeCurrencyWallet) => {
  const queryClient = useQueryClient()

  return useMutation(
    async (tokenInfo: EdgeTokenInfo) => {
      const tokenId = await wallet.currencyConfig.addCustomToken({
        currencyCode: tokenInfo.currencyCode,
        displayName: tokenInfo.currencyName,
        denominations: [{ name: tokenInfo.currencyName, multiplier: tokenInfo.multiplier }],
        networkLocation: { contractAddress: tokenInfo.contractAddress },
      })
      await wallet.changeEnabledTokenIds([...wallet.enabledTokenIds, tokenId])
      await queryClient.invalidateQueries([['info']])
      return tokenId
    },
    {
      ...useInvalidateQueries([['info']]),
    },
  )
}

const useRemoveCustomInfo = (wallet: EdgeCurrencyWallet) => {
  return useMutation((tokenId: string) => {
    return wallet.changeEnabledTokenIds(wallet.enabledTokenIds.filter((id) => id !== tokenId)).then(() => {
      return wallet.currencyConfig.removeCustomToken(tokenId)
    })
  })
}

const useEnableToken = (wallet: EdgeCurrencyWallet) => {
  const includedTokenInfos = getIncludedTokenInfos(wallet)
  const customTokenInfos = useCustomInfos(wallet)

  return useMutation(
    async (tokenId: string) => {
      if (!includedTokenInfos[tokenId] && !customTokenInfos[tokenId]) throw new Error(`Invalid tokenId: ${tokenId}`)

      await wallet.changeEnabledTokenIds([...wallet.enabledTokenIds, tokenId])
    },
    { useErrorBoundary: true },
  )
}

const useDisableToken = (wallet: EdgeCurrencyWallet) => {
  return useMutation((tokenId: string) => {
    return wallet.changeEnabledTokenIds(wallet.enabledTokenIds.filter((id) => id !== tokenId))
  })
}

export const useTokens = (wallet: EdgeCurrencyWallet) => {
  useWatch(wallet, 'enabledTokenIds')
  useWatch(wallet.currencyConfig, 'allTokens')
  useWatch(wallet.currencyConfig, 'builtinTokens')

  const includedTokenInfos = getIncludedTokenInfos(wallet)
  const customTokenInfos = useCustomInfos(wallet)

  return {
    includedTokenInfos,
    customTokenInfos,
    availableTokenInfos: [...Object.values(customTokenInfos), ...Object.values(includedTokenInfos)],
    addCustomInfo: useAddCustomInfo(wallet).mutate,
    removeCustomInfo: useRemoveCustomInfo(wallet).mutate,
    enabledTokenIds: wallet.enabledTokenIds,
    enable: useEnableToken(wallet).mutateAsync,
    disable: useDisableToken(wallet).mutate,
  }
}
