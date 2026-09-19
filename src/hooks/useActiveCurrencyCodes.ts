import { EdgeAccount } from 'edge-core-js'

import { getWalletListMeta, unique } from '../utils'
import { useWatch } from './watch'

export const getActiveCurrencyCodes = (account: EdgeAccount) => {
  const walletCurrencyCodes = account.activeWalletIds.map((id) => getWalletListMeta(account, id).currencyCode)
  const tokenCurrencyCodes = Object.values(account.currencyWallets).flatMap((wallet) =>
    wallet.enabledTokenIds
      .map((tokenId) => wallet.currencyConfig.allTokens[tokenId]?.currencyCode)
      .filter((currencyCode): currencyCode is string => {
        return !!currencyCode && currencyCode !== wallet.currencyInfo.currencyCode
      }),
  )

  return unique([...walletCurrencyCodes, ...tokenCurrencyCodes])
}

export const useActiveCurrencyCodes = (account: EdgeAccount) => {
  useWatch(account, 'activeWalletIds')

  return getActiveCurrencyCodes(account)
}
