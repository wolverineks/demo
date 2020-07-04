import { EdgeAccount } from 'edge-core-js'
import { useWatchAll } from 'edge-react-hooks'

import { getCurrencyInfos } from './useCurrencyInfos'

export const useWalletTypes = (account: EdgeAccount) => {
  useWatchAll(account)

  return getWalletTypes(account)
}
export const getWalletTypes = (account: EdgeAccount) =>
  getCurrencyInfos(account).map(
    ({ walletType: type, displayName: display, currencyCode, symbolImage: logo, symbolImageDarkMono: logoDark }) => ({
      display,
      type,
      currencyCode,
      logo,
      logoDark,
    }),
  )
