import { EdgeAccount } from 'edge-core-js'

import { getCurrencyInfos } from './getCurrencyInfos'

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
