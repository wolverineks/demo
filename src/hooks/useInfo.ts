import { EdgeAccount, EdgeCurrencyInfo, EdgeCurrencyWallet, EdgeMetaToken, EdgeToken, EdgeTokenId } from 'edge-core-js'

import { FiatInfo, fiatInfos, getCurrencyInfos } from '../utils'
import { metaTokenFromEdgeToken } from './tokens/utils'
import { useWatch } from './watch'

export const getCurrencyInfo = (account: EdgeAccount, currencyCode: string) => {
  return getCurrencyInfos(account).find((currencyInfo) => currencyInfo.currencyCode === currencyCode)
}

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

export const cryptoInfoFromCode = (account: EdgeAccount, currencyCode: string): EdgeCurrencyInfo | EdgeMetaToken => {
  const parent = getCurrencyInfo(account, currencyCode)
  if (parent) return parent

  for (const [pluginId, config] of Object.entries(account.currencyConfig)) {
    for (const [tokenId, token] of Object.entries(config.allTokens)) {
      if (token.currencyCode !== currencyCode) continue

      return metaToken(account, pluginId, tokenId, token)
    }
  }

  throw new Error(`Invalid Currency Code: ${currencyCode}`)
}

export function useCryptoInfo(account: EdgeAccount, currencyCode: string): EdgeCurrencyInfo | EdgeMetaToken
export function useCryptoInfo(
  account: EdgeAccount,
  pluginId: string,
  tokenId: EdgeTokenId,
): EdgeCurrencyInfo | EdgeMetaToken
export function useCryptoInfo(account: EdgeAccount, pluginIdOrCode: string, tokenId?: EdgeTokenId) {
  const byPlugin = arguments.length >= 3
  const config = byPlugin ? account.currencyConfig[pluginIdOrCode] : undefined
  useWatch(config, 'allTokens')

  if (byPlugin) return cryptoInfoFromPlugin(account, pluginIdOrCode, tokenId as EdgeTokenId)

  return cryptoInfoFromCode(account, pluginIdOrCode)
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

export const tokenDenominationKey = (wallet: EdgeCurrencyWallet, tokenId: EdgeTokenId) =>
  `${wallet.currencyInfo.pluginId}:${tokenId ?? 'native'}`
