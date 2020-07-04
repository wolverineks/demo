import { EdgeAccount } from 'edge-core-js'
import { useWatchAll } from 'edge-react-hooks'

export const useCurrencyInfos = (account: EdgeAccount) => {
  useWatchAll(account)

  return getCurrencyInfos(account)
}

export const getCurrencyInfos = (account: EdgeAccount) =>
  Object.values(account.currencyConfig).map(({ currencyInfo }) => currencyInfo)
