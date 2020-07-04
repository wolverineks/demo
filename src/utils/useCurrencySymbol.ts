import { EdgeAccount } from 'edge-core-js'
import { useWatchAll } from 'edge-react-hooks'

import { getCurrencyInfoFromWalletType } from './getCurrencyInfoFromWalletType'

export const useCurrencySymbol = ({ account, walletType }: { account: EdgeAccount; walletType: string }) => {
  useWatchAll(account)

  return getCurrencyInfoFromWalletType({ account, walletType }).denominations[0]?.symbol
}

export const getCurrencySymbol = (account: EdgeAccount, { walletType }: { walletType: string }) =>
  getCurrencyInfoFromWalletType({ account, walletType }).denominations[0]?.symbol
