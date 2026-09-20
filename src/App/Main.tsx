import { EdgeCurrencyWallet } from 'edge-core-js'
import React from 'react'

import { useEdgeAccount } from '../auth'
import { CreateWallet } from '../EdgeAccount'
import { SelectedWalletInfo } from '../EdgeAccount/SelectedWalletInfo'
import { Settings } from '../EdgeAccount/Settings'
import { Exchange } from '../Exchange'
import { readCustomTokenInfos, readEnabledTokenCurrencyCodes, useActiveWalletIds } from '../hooks'
import { Route, useRoute } from '../route'
import { SelectedWalletBoundary, useSelectedWallet } from '../SelectedWallet'
import { getTokenIdFromCurrencyCode } from '../utils'

export const Main = () => {
  const route = useRoute()
  const account = useEdgeAccount()
  const activeWalletIds = useActiveWalletIds(account)
  useBootstapWallets()

  return (
    <>
      {route === Route.account ? (
        <SelectedWalletBoundary fallback={<div className="empty-state">No selected wallet</div>}>
          <SelectedWalletInfo />
        </SelectedWalletBoundary>
      ) : route === Route.settings ? (
        <Settings />
      ) : route === Route.createWallet ? (
        <CreateWallet key={activeWalletIds.length} />
      ) : route === Route.exchange ? (
        <SelectedWalletBoundary>
          <ExchangeWithSelectedWallet />
        </SelectedWalletBoundary>
      ) : (
        <div>404</div>
      )}
    </>
  )
}

const ExchangeWithSelectedWallet = () => {
  const [{ wallet, currencyCode }] = useSelectedWallet()

  return <Exchange wallet={wallet} currencyCode={currencyCode} />
}

const useBootstapWallets = () => {
  const account = useEdgeAccount()

  React.useEffect(() => {
    account.activeWalletIds.map(async (id) => {
      const wallet = await account.waitForCurrencyWallet(id)
      enableTokens(wallet)
    })
  }, [account])
}

const enableTokens = async (wallet: EdgeCurrencyWallet) => {
  const customTokenInfos = await readCustomTokenInfos(wallet)
  const enabledTokenCurrencyCodes = await readEnabledTokenCurrencyCodes(wallet)
  await Promise.all(
    Object.values(customTokenInfos)
      .filter(({ currencyCode }) => enabledTokenCurrencyCodes.includes(currencyCode))
      .map(async (token) => {
        const tokenId = await wallet.currencyConfig.addCustomToken({
          currencyCode: token.currencyCode,
          displayName: token.currencyName,
          denominations: token.denominations,
          networkLocation: token.contractAddress ? { contractAddress: token.contractAddress } : undefined,
        })
        await wallet.changeEnabledTokenIds([...wallet.enabledTokenIds, tokenId])
      }),
  )
  const tokenIds = enabledTokenCurrencyCodes
    .map((currencyCode) => getTokenIdFromCurrencyCode(wallet, currencyCode))
    .filter((tokenId): tokenId is string => tokenId != null)
  if (tokenIds.length > 0) {
    await wallet.changeEnabledTokenIds(Array.from(new Set([...wallet.enabledTokenIds, ...tokenIds])))
  }
}
