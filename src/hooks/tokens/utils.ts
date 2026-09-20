import { EdgeCurrencyConfig, EdgeCurrencyWallet, EdgeMetaToken, EdgeToken, EdgeTokenInfo, EdgeTokenMap } from 'edge-core-js'

import { contractToTokenId, unique } from '../../utils'

export type Explorers = {
  addressExplorer?: string
  blockExplorer?: string
  transactionExplorer?: string
  xpubExplorer?: string
  pluginId?: string
  tokenId?: string
}

export type MetaTokenMap = { [currencyCode: string]: EdgeMetaToken & Explorers }

// CUSTOM TOKEN INFOS
const customTokenExplorers = (wallet: EdgeCurrencyWallet): Explorers => ({
  addressExplorer: wallet.currencyInfo.addressExplorer,
  blockExplorer: wallet.currencyInfo.blockExplorer,
  transactionExplorer: wallet.currencyInfo.transactionExplorer,
  xpubExplorer: wallet.currencyInfo.xpubExplorer,
  pluginId: wallet.currencyInfo.pluginId,
})

export const readCustomTokenInfos = (wallet: EdgeCurrencyWallet): MetaTokenMap =>
  toMetaTokenMapFromTokenMap(wallet.currencyConfig.customTokens, customTokenExplorers(wallet))

export const readCustomTokenInfo = (wallet: EdgeCurrencyWallet, tokenId: string) =>
  wallet.currencyConfig.customTokens[tokenId]

// ENABLED TOKEN CURRENCY CODES
export const enableTokenCurrencyCode = async (wallet: EdgeCurrencyWallet, tokenCurrencyCode: string) =>
  readEnabledTokenCurrencyCodes(wallet)
    .then((current) => unique([...current, tokenCurrencyCode]))
    .then((updated) => writeEnabledTokenCurrencyCodes(wallet, updated))

export const disableTokenCurrencyCode = async (wallet: EdgeCurrencyWallet, tokenCurrencyCode: string) =>
  readEnabledTokenCurrencyCodes(wallet)
    .then((current) => current.filter((currencyCode) => currencyCode !== tokenCurrencyCode))
    .then((updated) => writeEnabledTokenCurrencyCodes(wallet, updated))

const ENABLED_TOKEN_CURRENCY_CODES_FILE = 'enabledTokenCurrencyCodes.json'

export const readEnabledTokenCurrencyCodes = (wallet: EdgeCurrencyWallet) =>
  wallet.disklet
    .getText(ENABLED_TOKEN_CURRENCY_CODES_FILE)
    .then((text) => JSON.parse(text) as string[])
    .then((tokens) => tokens.filter((tokenCode) => tokenCode !== wallet.currencyInfo.currencyCode))
    .catch(() => [] as string[])

export const readEnabledCustomTokenInfos = async (wallet: EdgeCurrencyWallet): Promise<MetaTokenMap> => {
  const customTokenInfos = readCustomTokenInfos(wallet)
  const enabledCodes = await readEnabledTokenCurrencyCodes(wallet)

  return Object.fromEntries(
    Object.entries(customTokenInfos).filter(([currencyCode]) => enabledCodes.includes(currencyCode)),
  )
}

export const writeEnabledTokenCurrencyCodes = (wallet: EdgeCurrencyWallet, enabledTokens: string[]) =>
  wallet.disklet.setText(ENABLED_TOKEN_CURRENCY_CODES_FILE, JSON.stringify(enabledTokens))

export const removeKey = <T extends { [key: string]: any }>(key: string, object: T) => {
  const dup = { ...object }
  delete dup[key]

  return dup
}

// HELPERS
export const toCurrencyCodeMap = (items: EdgeMetaToken[]) =>
  items.reduce((result, current) => ({ ...result, [current.currencyCode]: current }), {} as MetaTokenMap)

export const metaTokenFromEdgeToken = (token: EdgeToken, extras: Explorers = {}): EdgeMetaToken & Explorers => {
  const networkLocation = token.networkLocation as { contractAddress?: string } | undefined

  return {
    currencyCode: token.currencyCode,
    currencyName: token.displayName,
    contractAddress: networkLocation?.contractAddress,
    denominations: token.denominations,
    ...extras,
  }
}

export const toMetaTokenMapFromTokenMap = (tokens: EdgeTokenMap = {}, extras: Explorers = {}): MetaTokenMap =>
  Object.entries(tokens).reduce((result, [tokenId, token]) => {
    result[token.currencyCode] = metaTokenFromEdgeToken(token, { ...extras, tokenId })

    return result
  }, {} as MetaTokenMap)

export const getIncludedInfos = (wallet: EdgeCurrencyWallet): MetaTokenMap => {
  const extras: Explorers = {
    addressExplorer: wallet.currencyInfo.addressExplorer,
    blockExplorer: wallet.currencyInfo.blockExplorer,
    transactionExplorer: wallet.currencyInfo.transactionExplorer,
    xpubExplorer: wallet.currencyInfo.xpubExplorer,
    pluginId: wallet.currencyInfo.pluginId,
  }

  return {
    ...toCurrencyCodeMap(
      (wallet.currencyInfo.metaTokens || []).map((token) => ({
        ...token,
        ...extras,
        tokenId: contractToTokenId(token.contractAddress),
      })),
    ),
    ...toMetaTokenMapFromTokenMap(wallet.currencyConfig?.builtinTokens, extras),
  }
}

export const getConfigTokenInfos = (config: EdgeCurrencyConfig) => {
  const extras: Explorers & { pluginId?: string } = {
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

export const toMetaToken = (wallet: EdgeCurrencyWallet, tokenInfo: EdgeTokenInfo): EdgeMetaToken & Explorers => ({
  ...tokenInfo,
  denominations: [{ name: tokenInfo.currencyName, multiplier: tokenInfo.multiplier }],
  symbolImage: '',
  addressExplorer: wallet.currencyInfo.addressExplorer,
  blockExplorer: wallet.currencyInfo.blockExplorer,
  transactionExplorer: wallet.currencyInfo.transactionExplorer,
  xpubExplorer: wallet.currencyInfo.xpubExplorer,
  pluginId: wallet.currencyInfo.pluginId,
  tokenId: contractToTokenId(tokenInfo.contractAddress),
})
