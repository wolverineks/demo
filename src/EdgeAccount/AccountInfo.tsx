import React from 'react'
import { Col, FormControl, ListGroup, Row } from 'react-bootstrap'

import { useAccount } from '../auth'
import { Boundary } from '../components'
import { WalletInfo } from '../EdgeCurrencyWallet'
import { useAccountTotal } from '../hooks'
import { Route, useRoute, useSetRoute } from '../route'
import { SearchQueryProvider, useSetSearchQuery } from '../search'
import { fallbackRender, useSelectedWallet } from '../SelectedWallet'
import { Settings } from '../Settings/Settings'
import { ActiveWalletList, ArchivedWalletList, DeletedWalletList } from '../WalletLists'
import { CreateWallet } from '.'

export const AccountInfo = () => {
  const route = useRoute()
  const account = useAccount()

  return (
    <Row>
      <Col xl={3} lg={3} md={3} sm={3}>
        <SearchQueryProvider>
          <Inner />
        </SearchQueryProvider>
      </Col>

      <Col>
        {route === Route.account ? (
          <Boundary error={{ fallbackRender: fallbackRender(<div>No Selected Wallet</div>) }}>
            <SelectedWalletInfo />
          </Boundary>
        ) : route === Route.settings ? (
          <SearchQueryProvider>
            <Settings />
          </SearchQueryProvider>
        ) : route === Route.createWallet ? (
          <CreateWallet key={account.activeWalletIds.length} />
        ) : (
          <div>404</div>
        )}
      </Col>
    </Row>
  )
}

const SelectedWalletInfo = () => {
  const [selected] = useSelectedWallet()

  return <WalletInfo wallet={selected.wallet} />
}

const Inner = () => {
  const route = useRoute()
  const setRoute = useSetRoute()
  const setSearchQuery = useSetSearchQuery()
  const {
    total,
    denomination: { symbol, name },
  } = useAccountTotal(useAccount())

  return (
    <div>
      <FormControl placeholder={'Search'} onChange={(event) => setSearchQuery(event.currentTarget.value)} />

      <ListGroup.Item>
        Account Total: {symbol} {total.toFixed(2)} {name}
      </ListGroup.Item>

      <Boundary>
        <ActiveWalletList onSelect={() => setRoute(Route.account)} />
      </Boundary>

      <Boundary>
        <ArchivedWalletList />
      </Boundary>

      <Boundary>
        <DeletedWalletList />
      </Boundary>

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
