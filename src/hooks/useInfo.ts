import { EdgeAccount, EdgeCurrencyWallet, EdgeToken, EdgeTokenId } from 'edge-core-js'

import { FiatInfo, fiatInfos } from '../utils'
import { metaTokenFromEdgeToken } from './tokens/utils'
import { useWatch } from './watch'

export const getFiatInfo = (currencyCode: string): FiatInfo => {
  const fiatInfo = fiatInfos.find(
    (info) => info.isoCurrencyCode === currencyCode || info.currencyCode === currencyCode,
  )
  if (!fiatInfo) throw new Error(`Invalid Currency Code: ${currencyCode}`)

  return fiatInfo
}

const metaToken = (account: EdgeAccount, pluginId: string, tokenId: string, token: EdgeToken) => {
  const currencyInfo = account.currencyConfig[pluginId].currencyInfo

  return metaTokenFromEdgeToken(token, {
    tokenId,
    pluginId,
    addressExplorer: currencyInfo.addressExplorer,
    blockExplorer: currencyInfo.blockExplorer,
    transactionExplorer: currencyInfo.transactionExplorer,
    xpubExplorer: currencyInfo.xpubExplorer,
  })
}

export const cryptoInfoFromPlugin = (account: EdgeAccount, pluginId: string, tokenId: EdgeTokenId) => {
  const config = account.currencyConfig[pluginId]
  if (!config) throw new Error(`Invalid pluginId: ${pluginId}`)
  if (tokenId == null) return config.currencyInfo

  const token = config.allTokens[tokenId]
  if (!token) throw new Error(`Invalid tokenId: ${tokenId}`)

  return metaToken(account, pluginId, tokenId, token)
}

export const useCryptoInfo = (account: EdgeAccount, pluginId: string, tokenId: EdgeTokenId) => {
  const config = account.currencyConfig[pluginId]
  useWatch(config, 'allTokens')

  return cryptoInfoFromPlugin(account, pluginId, tokenId)
}

export const getTokenInfo = (wallet: EdgeCurrencyWallet, tokenId: EdgeTokenId) => {
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

export const useTokenInfo = (wallet: EdgeCurrencyWallet, tokenId: EdgeTokenId) => {
  useWatch(wallet.currencyConfig, 'allTokens')

  return getTokenInfo(wallet, tokenId)
}

export const tokenDenominationKey = (pluginId: string, tokenId: EdgeTokenId) => `${pluginId}:${tokenId ?? 'native'}`
