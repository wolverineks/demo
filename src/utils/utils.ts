import { EdgeAccount, EdgeCurrencyInfo, EdgeMetaToken } from 'edge-core-js'

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

export const getCurrencyInfos = (account: EdgeAccount) => {
  return Object.values(account.currencyConfig).map(({ currencyInfo }) => currencyInfo)
}
