import { EdgeAccount } from 'edge-core-js'

export const getCurrencyConfig = ({ account, walletType }: { account: EdgeAccount; walletType: string }) => {
  return Object.values(account.currencyConfig).find(
    (currencyConfig) => currencyConfig.currencyInfo.walletType === walletType,
  )!
}
