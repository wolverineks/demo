import { EdgeCurrencyWallet } from 'edge-core-js'

import { InactiveWallet } from '../hooks'

export const useFilteredWalletIds = (
  currencyWallets: (EdgeCurrencyWallet | InactiveWallet)[],
  walletIds: string[],
  query: string,
) => {
  const eliminatedIds = currencyWallets.filter(isEliminated(query)).map(({ id }) => id)

  return walletIds.filter((id) => !eliminatedIds.includes(id))
}

const normalize = (text: string) => text.trim().toLowerCase()

const isEliminated = (query: string) => (wallet: EdgeCurrencyWallet | InactiveWallet) =>
  !normalize(wallet.name || '').includes(normalize(query)) &&
  !normalize(wallet.currencyInfo.currencyCode).includes(normalize(query)) &&
  !normalize(wallet.fiatCurrencyCode).includes(normalize(query))
