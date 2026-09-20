import { EdgeAccount, EdgeCurrencyWallet, EdgeTokenId } from 'edge-core-js'

import { getCurrencyCodeFromTokenId, getWalletListMeta, unique } from '../utils'
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

export type ActiveAsset = {
  key: string
  pluginId: string
  tokenId: EdgeTokenId
  wallet: EdgeCurrencyWallet
  currencyCode: string
}

export const getActiveAssets = (account: EdgeAccount): ActiveAsset[] => {
  const seen = new Set<string>()
  const assets: ActiveAsset[] = []

  for (const wallet of Object.values(account.currencyWallets)) {
    const add = (tokenId: EdgeTokenId) => {
      const key = `${wallet.currencyInfo.pluginId}:${tokenId ?? 'native'}`
      if (seen.has(key)) return
      seen.add(key)
      assets.push({
        key,
        pluginId: wallet.currencyInfo.pluginId,
        tokenId,
        wallet,
        currencyCode: getCurrencyCodeFromTokenId(wallet, tokenId),
      })
    }

    add(null)
    wallet.enabledTokenIds.forEach(add)
  }

  return assets
}

export const useActiveAssets = (account: EdgeAccount) => {
  useWatch(account, 'activeWalletIds')
  useWatch(account, 'currencyWallets')

  return getActiveAssets(account)
}
