import React from 'react'

import { useEdgeAccount } from '../auth'
import { Exchange } from '../Exchange'
import { useActiveWalletIds } from '../hooks'
import { Route, useRoute } from '../route'
import { useSelectedWallet } from '../SelectedWallet'
import { SelectedWalletInfo } from './SelectedWalletInfo'
import { Settings } from './Settings'
import { CreateWallet } from '.'

export const Main = () => {
  const route = useRoute()
  const account = useEdgeAccount()
  const activeWalletIds = useActiveWalletIds(account)
  const [{ wallet, currencyCode }] = useSelectedWallet()

  return (
    <>
      {route === Route.account ? (
        <SelectedWalletInfo />
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
