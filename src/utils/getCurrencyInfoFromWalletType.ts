import { EdgeAccount } from 'edge-core-js'

import { getCurrencyConfig } from './getCurrencyConfig'

export const getCurrencyInfoFromWalletType = ({ account, walletType }: { account: EdgeAccount; walletType: string }) =>
  getCurrencyConfig({ account, walletType }).currencyInfo
