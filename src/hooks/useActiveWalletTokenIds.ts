import { EdgeAccount, EdgeCurrencyWallet, EdgeTokenId } from 'edge-core-js'

import { uniqueBy } from '../utils'
import { useWatch } from './watch'

export const getWalletTokenIds = (wallet: EdgeCurrencyWallet): EdgeTokenId[] => [null, ...wallet.enabledTokenIds]

export const getActiveWalletTokenIds = (account: EdgeAccount) =>
  uniqueBy(
    ({ wallet, tokenId }) => `${wallet.currencyInfo.pluginId}:${tokenId ?? 'native'}`,
    Object.values(account.currencyWallets).flatMap((wallet) =>
      getWalletTokenIds(wallet).map((tokenId) => ({ wallet, tokenId })),
    ),
  )

export const useActiveWalletTokenIds = (account: EdgeAccount) => {
  useWatch(account, 'activeWalletIds')
  useWatch(account, 'currencyWallets')

  return getActiveWalletTokenIds(account)
}
