import { EdgeAccount, EdgeCurrencyWallet, EdgeTokenId } from 'edge-core-js'

import { getCurrencyCodeFromTokenId, uniqueBy } from '../utils'
import { useWatch } from './watch'

export type ActiveTokenId = {
  key: string
  pluginId: string
  tokenId: EdgeTokenId
  wallet: EdgeCurrencyWallet
  currencyCode: string
}

export const getActiveTokenIds = (account: EdgeAccount): ActiveTokenId[] =>
  uniqueBy(
    ({ key }) => key,
    Object.values(account.currencyWallets).flatMap((wallet) =>
      [null, ...wallet.enabledTokenIds].map((tokenId) => ({
        key: `${wallet.currencyInfo.pluginId}:${tokenId ?? 'native'}`,
        pluginId: wallet.currencyInfo.pluginId,
        tokenId,
        wallet,
        currencyCode: getCurrencyCodeFromTokenId(wallet, tokenId),
      })),
    ),
  )

export const useActiveTokenIds = (account: EdgeAccount) => {
  useWatch(account, 'activeWalletIds')
  useWatch(account, 'currencyWallets')

  return getActiveTokenIds(account)
}
