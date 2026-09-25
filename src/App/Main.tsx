import React from 'react'

import { CreateWallet } from '../EdgeAccount'
import { SelectedWalletInfo } from '../EdgeAccount/SelectedWalletInfo'
import { Settings } from '../EdgeAccount/Settings'
import { Exchange } from '../Exchange'
import { useActiveWalletIds } from '../hooks'
import { Route, useRoute } from '../route'
import { SelectedWalletBoundary } from '../SelectedWallet'

export const Main = () => {
  const route = useRoute()
  const activeWalletIds = useActiveWalletIds()

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
          <Exchange />
        </SelectedWalletBoundary>
      ) : (
        <div>404</div>
      )}
    </>
  )
}
