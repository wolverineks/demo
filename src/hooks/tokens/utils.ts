import { EdgeCurrencyWallet, EdgeMetaToken, EdgeToken, EdgeTokenMap } from 'edge-core-js'

import { contractToTokenId } from '../../utils'

export type Explorers = {
  addressExplorer?: string
  blockExplorer?: string
  transactionExplorer?: string
  xpubExplorer?: string
  pluginId?: string
  tokenId?: string
}

export type TokenInfo = EdgeMetaToken & Explorers & { tokenId: string }

export type MetaTokenMap = { [tokenId: string]: TokenInfo }

const explorersFromWallet = (wallet: EdgeCurrencyWallet): Explorers => ({
  addressExplorer: wallet.currencyInfo.addressExplorer,
  blockExplorer: wallet.currencyInfo.blockExplorer,
  transactionExplorer: wallet.currencyInfo.transactionExplorer,
  xpubExplorer: wallet.currencyInfo.xpubExplorer,
  pluginId: wallet.currencyInfo.pluginId,
})

export const readCustomTokenInfos = (wallet: EdgeCurrencyWallet): MetaTokenMap =>
  toMetaTokenMapFromTokenMap(wallet.currencyConfig.customTokens, explorersFromWallet(wallet))

export const metaTokenFromEdgeToken = (token: EdgeToken, extras: Explorers = {}): TokenInfo => {
  const networkLocation = token.networkLocation as { contractAddress?: string } | undefined

  return {
    currencyCode: token.currencyCode,
    currencyName: token.displayName,
    contractAddress: networkLocation?.contractAddress,
    denominations: token.denominations,
    tokenId: extras.tokenId ?? '',
    ...extras,
  }
}

export const toMetaTokenMapFromTokenMap = (tokens: EdgeTokenMap = {}, extras: Explorers = {}): MetaTokenMap =>
  Object.entries(tokens).reduce((result, [tokenId, token]) => {
    result[tokenId] = metaTokenFromEdgeToken(token, { ...extras, tokenId })

    return result
  }, {} as MetaTokenMap)

export const getIncludedTokenInfos = (wallet: EdgeCurrencyWallet): MetaTokenMap => {
  const extras = explorersFromWallet(wallet)
  const fromMeta = (wallet.currencyInfo.metaTokens || []).reduce((result, token) => {
    const tokenId = contractToTokenId(token.contractAddress)
    if (!tokenId) return result
    result[tokenId] = { ...token, ...extras, tokenId }

    return result
  }, {} as MetaTokenMap)

  return {
    ...fromMeta,
    ...toMetaTokenMapFromTokenMap(wallet.currencyConfig?.builtinTokens, extras),
  }
}
