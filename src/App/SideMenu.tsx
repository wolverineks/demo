import React from 'react'

import { useEdgeAccount } from '../auth'
import { Boundary, FormControl, ListGroup } from '../components'
import { useEdgeAccountTotal } from '../hooks'
import { Route, useRoute, useSetRoute } from '../route'
import { ActiveWalletList, ArchivedWalletList, DeletedWalletList } from '../WalletLists'

const AccountTotal = () => {
  const account = useEdgeAccount()
  const {
    total,
    denomination: { symbol, name },
  } = useEdgeAccountTotal(account)

  return (
    <ListGroup.Item>
      Account Total: {symbol} {total.toFixed(2)} {name}
    </ListGroup.Item>
  )
}

export const SideMenu = () => {
  const route = useRoute()
  const setRoute = useSetRoute()
  const [searchQuery, setSearchQuery] = React.useState('')

  return (
    <div>
      <FormControl placeholder={'Search'} onChange={(event) => setSearchQuery(event.currentTarget.value)} />

      <Boundary>
        <AccountTotal />
      </Boundary>

      <Boundary>
        <ActiveWalletList onSelect={() => setRoute(Route.account)} searchQuery={searchQuery} />
      </Boundary>

      <Boundary>
        <ArchivedWalletList searchQuery={searchQuery} />
      </Boundary>

      <Boundary>
        <DeletedWalletList searchQuery={searchQuery} />
      </Boundary>

      <ListGroup.Item
        variant={route === Route.exchange ? 'primary' : undefined}
        onClick={() => setRoute(Route.exchange)}
      >
        Exchange
      </ListGroup.Item>

      <ListGroup.Item
        variant={route === Route.createWallet ? 'primary' : undefined}
        onClick={() => setRoute(Route.createWallet)}
      >
        New Wallet
      </ListGroup.Item>

      <ListGroup.Item
        variant={route === Route.settings ? 'primary' : undefined}
        onClick={() => setRoute(Route.settings)}
      >
        Settings
      </ListGroup.Item>
    </div>
  )
}
