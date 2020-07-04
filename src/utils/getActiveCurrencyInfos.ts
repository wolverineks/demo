import { EdgeAccount } from 'edge-core-js'

export const getActiveCurrencyInfos = (account: EdgeAccount) =>
  Array.from(new Set(Object.values(account.currencyWallets).map(({ currencyInfo }) => currencyInfo)))
