import { EdgeAccount } from 'edge-core-js'

import { getCurrencyConfig } from './useCurrencyConfig'

export const getCurrencyInfoFromWalletType = ({ account, walletType }: { account: EdgeAccount; walletType: string }) =>
  getCurrencyConfig({ account, walletType }).currencyInfo
