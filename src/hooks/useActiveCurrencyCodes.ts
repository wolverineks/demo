import { EdgeAccount, EdgeCurrencyWallet, EdgeTokenId } from 'edge-core-js'

import { getCurrencyCodeFromTokenId, getWalletListMeta, unique, uniqueBy } from '../utils'
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
  useWatch(account, 'currencyWallets')

  return getActiveCurrencyCodes(account)
}

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
