import { EdgeAccount, EdgeContext, EdgeCurrencyInfo, EdgeCurrencyWallet, EdgeMetaToken } from 'edge-core-js'

import { InactiveWallet } from '../hooks'
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

// EDGE CONTEXT
export const getAccountsWithPinLogin = (context: EdgeContext) => {
  return context.localUsers.filter(({ pinLoginEnabled }) => pinLoginEnabled)
}

// EDGE ACCOUNT
export const getCurrencyCodeFromWalletId = (account: EdgeAccount, id: string) => {
  const { allKeys, currencyConfig } = account
  const walletInfo = allKeys.find((walletInfo) => walletInfo.id === id)
  const currencyCode = Object.values(currencyConfig).find(
    ({ currencyInfo }) => currencyInfo.walletType === walletInfo?.type,
  )!.currencyInfo.currencyCode

  return currencyCode
}

export const getSortedCurrencyWallets = (account: EdgeAccount) => {
  return account.activeWalletIds.map((id) => account.currencyWallets[id]).filter(Boolean)
}

export const getWalletTypes = (account: EdgeAccount) => {
  return getCurrencyInfos(account).map(({ displayName, walletType, ...currencyInfo }) => ({
    name: displayName,
    type: walletType,
    ...currencyInfo,
  }))
}

export const getCurrencyInfos = (account: EdgeAccount) => {
  return Object.values(account.currencyConfig).map(({ currencyInfo }) => currencyInfo)
}

// EDGE CURRENCY WALLET
export const getBalance = (wallet: EdgeCurrencyWallet | InactiveWallet, currencyCode: string) => {
  return wallet.balances[currencyCode]
}
