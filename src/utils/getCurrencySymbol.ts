import { EdgeAccount } from 'edge-core-js'

import { getCurrencyInfoFromWalletType } from '../utils'

export const getCurrencySymbol = (account: EdgeAccount, { walletType }: { walletType: string }) =>
  getCurrencyInfoFromWalletType({ account, walletType }).denominations[0]?.symbol
