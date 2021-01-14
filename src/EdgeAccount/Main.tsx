import React from 'react'

import { useEdgeAccount } from '../auth'
import { WalletInfo } from '../EdgeCurrencyWallet'
import { Route, useRoute } from '../route'
import { SelectedWalletBoundary, useSelectedWallet } from '../SelectedWallet'
import { Settings } from '../Settings/Settings'
import { CreateWallet } from '.'

export const Main = () => {
  const route = useRoute()
  const account = useEdgeAccount()

  return (
    <>
      {route === Route.account ? (
        <SelectedWalletBoundary fallback={<div>No Selected Wallet</div>}>
          <SelectedWalletInfo />
        </SelectedWalletBoundary>
      ) : route === Route.settings ? (
        <Settings />
      ) : route === Route.createWallet ? (
        <CreateWallet key={account.activeWalletIds.length} />
      ) : (
        <div>404</div>
      )}
    </>
  )
}

const SelectedWalletInfo = () => {
  const [selected] = useSelectedWallet()

  return <WalletInfo wallet={selected.wallet} currencyCode={selected.currencyCode} />
}
