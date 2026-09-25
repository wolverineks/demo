import { EdgeAccount, EdgeToken, EdgeTokenId } from 'edge-core-js'

import { useEdgeAccount } from '../auth'
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

export const getCryptoInfo = (account: EdgeAccount, pluginId: string, tokenId: EdgeTokenId) => {
  const config = account.currencyConfig[pluginId]
  if (!config) throw new Error(`Invalid pluginId: ${pluginId}`)
  if (tokenId == null) return config.currencyInfo

  const token = config.allTokens[tokenId]
  if (!token) throw new Error(`Invalid tokenId: ${tokenId}`)

  return metaToken(account, pluginId, tokenId, token)
}

export const getCurrencyCodeFromTokenId = (account: EdgeAccount, pluginId: string, tokenId: EdgeTokenId) =>
  getCryptoInfo(account, pluginId, tokenId).currencyCode

export const useCryptoInfo = (pluginId: string, tokenId: EdgeTokenId) => {
  const account = useEdgeAccount()
  const config = account.currencyConfig[pluginId]
  useWatch(config, 'allTokens')

  return getCryptoInfo(account, pluginId, tokenId)
}

export const tokenDenominationKey = (pluginId: string, tokenId: EdgeTokenId) => `${pluginId}:${tokenId ?? 'native'}`
