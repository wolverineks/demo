import { InactiveWallet } from '../hooks'

export const getBalance = (wallet: InactiveWallet, currencyCode: string) => {
  return wallet.balances[currencyCode]
}
