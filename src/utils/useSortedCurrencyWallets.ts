import { EdgeAccount } from 'edge-core-js'
import { useWatchAll } from 'edge-react-hooks'

export const useSortedCurrencyWallets = (account: EdgeAccount) => {
  useWatchAll(account)

  return getSortedCurrencyWallets(account)
}

export const getSortedCurrencyWallets = (account: EdgeAccount) => {
  const { activeWalletIds, currencyWallets } = account

  return activeWalletIds.map((id) => currencyWallets[id])
}
