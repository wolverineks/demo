import {
  EdgeAccount,
  EdgeAddress,
  EdgeCurrencyInfo,
  EdgeCurrencyWallet,
  EdgeMetaToken,
  EdgeTokenId,
} from 'edge-core-js'

import { FiatInfo } from './fiatInfos'

export const unique = <T>(array: T[]) =>
  array.filter((item: T, index: number, array: T[]) => array.indexOf(item) === index)

export const uniqueBy = <T>(deriveComparator: (item: T) => string, array: T[]) => {
  const map = array.reduce(
    (result, current) => ({ ...result, [deriveComparator(current)]: current }),
    {} as { [key: string]: T },
  )

  return Object.values(map) as T[]
}

export const normalize = (text: string) => text.trim().toLowerCase()

export const isToken = (info: EdgeCurrencyInfo | EdgeMetaToken | FiatInfo): info is EdgeMetaToken =>
  (info as any).currencyName != null

export const isFiat = (info: EdgeCurrencyInfo | EdgeMetaToken | FiatInfo): info is FiatInfo =>
  (info as any).isoCurrencyCode != null

export const getSortedCurrencyWallets = (account: EdgeAccount) => {
  return account.activeWalletIds.map((id) => account.currencyWallets[id]).filter(Boolean)
}

export const getWalletListMeta = (account: EdgeAccount, walletId: string) => {
  const walletInfo = account.allKeys.find((info) => info.id === walletId)
  const config = Object.values(account.currencyConfig).find(
    ({ currencyInfo }) => currencyInfo.walletType === walletInfo?.type,
  )
  const loaded = account.currencyWallets[walletId]
  const currencyCode = loaded?.currencyInfo.currencyCode ?? config?.currencyInfo.currencyCode ?? 'UNKNOWN'

  return {
    currencyCode,
    name: loaded?.name || config?.currencyInfo.displayName || currencyCode,
    pluginId: loaded?.currencyInfo.pluginId ?? config?.currencyInfo.pluginId,
  }
}

export const getCurrencyInfos = (account: EdgeAccount) => {
  return Object.values(account.currencyConfig).map(({ currencyInfo }) => currencyInfo)
}

export const getTokenIdFromCurrencyCode = (wallet: EdgeCurrencyWallet, currencyCode?: string): EdgeTokenId => {
  if (!currencyCode || currencyCode === wallet.currencyInfo.currencyCode) return null

  const match = Object.entries(wallet.currencyConfig.allTokens).find(([, token]) => token.currencyCode === currencyCode)

  return match?.[0] ?? null
}

export const getCurrencyCodeFromTokenId = (wallet: EdgeCurrencyWallet, tokenId: EdgeTokenId): string => {
  if (tokenId == null) return wallet.currencyInfo.currencyCode

  return wallet.currencyConfig.allTokens[tokenId]?.currencyCode ?? wallet.currencyInfo.currencyCode
}

export const getWalletTokenIds = (wallet: EdgeCurrencyWallet): EdgeTokenId[] => [null, ...wallet.enabledTokenIds]

export const getNativeBalance = (wallet: EdgeCurrencyWallet, tokenId: EdgeTokenId): string =>
  wallet.balanceMap.get(tokenId) ?? '0'

export const getPublicAddress = (addresses: EdgeAddress[]): string | undefined =>
  addresses.find((address) => address.addressType === 'publicAddress')?.publicAddress ?? addresses[0]?.publicAddress
