import React from 'react'

import { useEdgeAccount } from '../auth'
import { CreateWallet } from '../EdgeAccount'
import { SelectedWalletInfo } from '../EdgeAccount/SelectedWalletInfo'
import { Settings } from '../EdgeAccount/Settings'
import { Exchange } from '../Exchange'
import { useActiveWalletIds } from '../hooks'
import { Route, useRoute } from '../route'
import { SelectedWalletBoundary, useSelectedWallet } from '../SelectedWallet'

export const Main = () => {
  const route = useRoute()
  const account = useEdgeAccount()
  const activeWalletIds = useActiveWalletIds(account)

  return (
    <>
      {route === Route.account ? (
        <SelectedWalletBoundary fallback={<div>No Selected Wallet</div>}>
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
