import { EdgeCurrencyConfig, EdgeCurrencyWallet, EdgeMetaToken, EdgeToken, EdgeTokenInfo, EdgeTokenMap } from 'edge-core-js'

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

export const readCustomTokenInfo = (wallet: EdgeCurrencyWallet, tokenId: string) =>
  wallet.currencyConfig.customTokens[tokenId]

export const removeKey = <T extends { [key: string]: any }>(key: string, object: T) => {
  const dup = { ...object }
  delete dup[key]

  return dup
}

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

export const getIncludedInfos = (wallet: EdgeCurrencyWallet): MetaTokenMap => {
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

export const getConfigTokenInfos = (config: EdgeCurrencyConfig) => {
  const extras: Explorers = {
    addressExplorer: config.currencyInfo.addressExplorer,
    blockExplorer: config.currencyInfo.blockExplorer,
    transactionExplorer: config.currencyInfo.transactionExplorer,
    xpubExplorer: config.currencyInfo.xpubExplorer,
    pluginId: config.currencyInfo.pluginId,
  }

  const fromMeta = (config.currencyInfo.metaTokens || []).map((token) => ({
    ...token,
    ...extras,
    tokenId: contractToTokenId(token.contractAddress),
  }))
  const fromConfig = Object.entries({
    ...(config.builtinTokens || {}),
    ...(config.allTokens || {}),
  }).map(([tokenId, token]) => metaTokenFromEdgeToken(token, { ...extras, tokenId }))

  return [...fromMeta, ...fromConfig]
}

export const toMetaToken = (wallet: EdgeCurrencyWallet, tokenInfo: EdgeTokenInfo): TokenInfo => ({
  ...tokenInfo,
  denominations: [{ name: tokenInfo.currencyName, multiplier: tokenInfo.multiplier }],
  symbolImage: '',
  ...explorersFromWallet(wallet),
  tokenId: contractToTokenId(tokenInfo.contractAddress) ?? '',
})
