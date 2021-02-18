import { EdgeCurrencyWallet, EdgeMetaToken, EdgeTokenInfo } from 'edge-core-js'

import { unique } from '../../utils'

export type MetaTokenMap = { [currencyCode: string]: EdgeMetaToken }

export type Explorers = {
  addressExplorer?: string
  blockExplorer?: string
  transactionExplorer?: string
  xpubExplorer?: string
}

// CUSTOM TOKEN INFOS
export const addCustomToken = (wallet: EdgeCurrencyWallet, tokenInfo: EdgeTokenInfo) => {
  return readCustomTokenInfos(wallet)
    .then((currentMap) => ({ ...currentMap, [tokenInfo.currencyCode]: toMetaToken(wallet, tokenInfo) }))
    .then((updated) => writeCustomTokenInfos(wallet, updated))
}

export const removeCustomToken = (wallet: EdgeCurrencyWallet, currencyCode: string) => {
  return readCustomTokenInfos(wallet)
    .then((currentMap) => removeKey(currencyCode, currentMap))
    .then((updated) => writeCustomTokenInfos(wallet, updated))
}

const CUSTOM_TOKENS_INFOS_FILE = 'customTokenInfos.json'

export const readCustomTokenInfos = (wallet: EdgeCurrencyWallet): Promise<MetaTokenMap> => {
  return wallet.disklet
    .getText(CUSTOM_TOKENS_INFOS_FILE)
    .then((text: string) => JSON.parse(text) as MetaTokenMap)
    .catch(() => ({}))
}

export const readCustomTokenInfo = async (wallet: EdgeCurrencyWallet, currencyCode: string) =>
  (await readCustomTokenInfos(wallet))[currencyCode]

export const writeCustomTokenInfos = (wallet: EdgeCurrencyWallet, customTokens: MetaTokenMap) => {
  return wallet.disklet.setText(CUSTOM_TOKENS_INFOS_FILE, JSON.stringify(customTokens))
}

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

export const toMetaToken = (wallet: EdgeCurrencyWallet, tokenInfo: EdgeTokenInfo): EdgeMetaToken & Explorers => ({
  ...tokenInfo,
  denominations: [{ name: tokenInfo.currencyName, multiplier: tokenInfo.multiplier }],
  symbolImage: '',
  addressExplorer: wallet.currencyInfo.addressExplorer,
  blockExplorer: wallet.currencyInfo.blockExplorer,
  transactionExplorer: wallet.currencyInfo.transactionExplorer,
  xpubExplorer: wallet.currencyInfo.xpubExplorer,
})
