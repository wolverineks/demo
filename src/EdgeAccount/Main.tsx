import React from 'react'

import { useEdgeAccount } from '../auth'
import { Exchange } from '../Exchange'
import { useActiveWalletIds } from '../hooks'
import { Route, useRoute } from '../route'
import { SelectedWalletBoundary, useSelectedWallet } from '../SelectedWallet'
import { Settings } from '../Settings/Settings'
import { SelectedWalletInfo } from './SelectedWalletInfo'
import { CreateWallet } from '.'

export const Main = () => {
  const route = useRoute()
  const account = useEdgeAccount()
  const activeWalletIds = useActiveWalletIds(account)
  const [{ wallet, currencyCode }] = useSelectedWallet()

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
        <Exchange wallet={wallet} currencyCode={currencyCode} />
      ) : (
        <div>404</div>
      )}
    </>
  )
}
