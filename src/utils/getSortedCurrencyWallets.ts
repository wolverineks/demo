import { EdgeAccount } from 'edge-core-js'

export const getSortedCurrencyWallets = (account: EdgeAccount) => {
  const { activeWalletIds, currencyWallets } = account

  return activeWalletIds.map((id) => currencyWallets[id])
}
