import { EdgeAccount } from 'edge-core-js'

export const getCurrencyInfos = (account: EdgeAccount) =>
  Object.values(account.currencyConfig).map(({ currencyInfo }) => currencyInfo)
