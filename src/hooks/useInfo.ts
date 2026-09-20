import { EdgeAccount, EdgeCurrencyWallet, EdgeTokenId } from 'edge-core-js'
import { useQuery } from 'react-query'

import { fiatInfos, getCurrencyInfos } from '../utils'
import { metaTokenFromEdgeToken, readCustomTokenInfos } from './tokens/utils'
import { useWatch } from './watch'

export const getCurrencyInfo = (account: EdgeAccount, currencyCode: string) => {
  return getCurrencyInfos(account).find((currencyInfo) => currencyInfo.currencyCode === currencyCode)
}

export const getFiatInfo = (currencyCode: string) => {
  return fiatInfos.find(
    (fiatInfo) => fiatInfo.isoCurrencyCode === currencyCode || fiatInfo.currencyCode === currencyCode,
  )
}

export const getTokenIdInfo = (wallet: EdgeCurrencyWallet, tokenId: EdgeTokenId) => {
  if (tokenId == null) return wallet.currencyInfo

  const token = wallet.currencyConfig.allTokens[tokenId]
  if (!token) throw new Error(`Invalid tokenId: ${tokenId}`)

  return metaTokenFromEdgeToken(token, {
    tokenId,
    pluginId: wallet.currencyInfo.pluginId,
    addressExplorer: wallet.currencyInfo.addressExplorer,
    blockExplorer: wallet.currencyInfo.blockExplorer,
    transactionExplorer: wallet.currencyInfo.transactionExplorer,
    xpubExplorer: wallet.currencyInfo.xpubExplorer,
  })
}

export const useTokenIdInfo = (wallet: EdgeCurrencyWallet, tokenId: EdgeTokenId) => {
  useWatch(wallet.currencyConfig, 'allTokens')

  return getTokenIdInfo(wallet, tokenId)
}

export const getInfo = (account: EdgeAccount, currencyCode: string) => {
  return getCurrencyInfo(account, currencyCode) || getFiatInfo(currencyCode)
}

export const useInfo = (account: EdgeAccount, currencyCode: string) => {
  const known = getInfo(account, currencyCode)
  const { data } = useQuery({
    queryKey: ['info', currencyCode],
    enabled: !known,
    suspense: !known,
    queryFn: async () => {
      const wallets = Object.values(account.currencyWallets)
      for (const wallet of wallets) {
        const match = Object.values(readCustomTokenInfos(wallet)).find((token) => token.currencyCode === currencyCode)

        if (match) {
          return match
        }
      }

      throw new Error(`Invalid Currency Code: ${currencyCode}`)
    },
  })

  const info = known || data
  if (!info) throw new Error(`Invalid Currency Code: ${currencyCode}`)

  return info
}

export const tokenIdDenominationKey = (wallet: EdgeCurrencyWallet, tokenId: EdgeTokenId) =>
  `${wallet.currencyInfo.pluginId}:${tokenId ?? 'native'}`
