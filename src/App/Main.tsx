import { EdgeCurrencyWallet } from 'edge-core-js'
import React from 'react'

import { useEdgeAccount } from '../auth'
import { CreateWallet } from '../EdgeAccount'
import { SelectedWalletInfo } from '../EdgeAccount/SelectedWalletInfo'
import { Settings } from '../EdgeAccount/Settings'
import { Exchange } from '../Exchange'
import { readEnabledCustomTokenInfos, useActiveWalletIds } from '../hooks'
import { Route, useRoute } from '../route'
import { SelectedWalletBoundary, useSelectedWallet } from '../SelectedWallet'

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
  const enabledCustomTokenInfos = await readEnabledCustomTokenInfos(wallet)
  const customTokenIds = Object.values(enabledCustomTokenInfos)
    .map((tokenInfo) => tokenInfo.tokenId)
    .filter((tokenId): tokenId is string => tokenId != null)

  const tokenIds = [...wallet.enabledTokenIds, ...customTokenIds]
  if (tokenIds.length > 0) await wallet.changeEnabledTokenIds(tokenIds)
}
