import { EdgeCurrencyWallet, EdgeTokenInfo } from 'edge-core-js'
import { useMutation, useQueryClient } from 'react-query'

import { getTokenIdFromCurrencyCode } from '../../utils'
import { enabledTokenCurrencyCodes, getIncludedInfos, readCustomTokenInfos } from './utils'
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
      await queryClient.invalidateQueries([
        ['info', tokenInfo.currencyCode],
        [tokenInfo.currencyCode, 'displayDenomination'],
        ['displayDenomination', tokenInfo.currencyCode],
      ])
    },
    {
      ...useInvalidateQueries([['info']]),
    },
  )
}

const useRemoveCustomInfo = (wallet: EdgeCurrencyWallet) => {
  return useMutation((currencyCode: string) => {
    const tokenId = getTokenIdFromCurrencyCode(wallet, currencyCode)
    return wallet.changeEnabledTokenIds(wallet.enabledTokenIds.filter((id) => id !== tokenId)).then(() => {
      if (tokenId) return wallet.currencyConfig.removeCustomToken(tokenId)
    })
  })
}

const useEnableToken = (wallet: EdgeCurrencyWallet) => {
  const tokenInfos = getIncludedInfos(wallet)
  const customTokenInfos = useCustomInfos(wallet)

  const enableToken = async (tokenCurrencyCode: string) => {
    if (!tokenInfos[tokenCurrencyCode] && !customTokenInfos[tokenCurrencyCode])
      throw new Error(`Invalid Currency Code: ${tokenCurrencyCode}`)

    const tokenId = getTokenIdFromCurrencyCode(wallet, tokenCurrencyCode)
    if (!tokenId) return
    await wallet.changeEnabledTokenIds([...wallet.enabledTokenIds, tokenId])
  }

  return useMutation(enableToken, {
    useErrorBoundary: true,
  })
}

const useDisableToken = (wallet: EdgeCurrencyWallet) => {
  return useMutation((tokenCurrencyCode: string) => {
    const tokenId = getTokenIdFromCurrencyCode(wallet, tokenCurrencyCode)

    return wallet.changeEnabledTokenIds(wallet.enabledTokenIds.filter((id) => id !== tokenId))
  })
}

export const useTokens = (wallet: EdgeCurrencyWallet) => {
  useWatch(wallet, 'enabledTokenIds')
  useWatch(wallet.currencyConfig, 'allTokens')
  useWatch(wallet.currencyConfig, 'builtinTokens')

  return {
    includedInfos: getIncludedInfos(wallet),
    customTokenInfos: useCustomInfos(wallet),
    addCustomInfo: useAddCustomInfo(wallet).mutate,
    removeCustomInfo: useRemoveCustomInfo(wallet).mutate,
    enabled: enabledTokenCurrencyCodes(wallet),
    enable: useEnableToken(wallet).mutateAsync,
    disable: useDisableToken(wallet).mutate,
  }
}
