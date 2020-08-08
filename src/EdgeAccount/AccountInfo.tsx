import React from 'react'
import { Button, Col, FormControl, Row } from 'react-bootstrap'

import { useAccount } from '../auth'
import { Boundary } from '../components'
import { WalletInfo } from '../EdgeCurrencyWallet/WalletInfo'
import { useActiveWalletIds } from '../hooks'
import { Route, useRoute, useSetRoute } from '../route'
import { SearchQueryProvider, useSetSearchQuery } from '../search'
import { useSelectWallet, useSelectedWallet } from '../SelectedWallet'
import { Settings } from '../Settings/Settings'
import { ActiveWalletList, ArchivedWalletList, DeletedWalletList } from '../WalletLists'
import { CreateWallet } from '.'

export const AccountInfo = () => {
  const route = useRoute()
  const selectedWallet = useSelectedWallet()

  return (
    <Row>
      <Col xl={3} lg={3} md={3} sm={3} xs={0}>
        <SearchQueryProvider>
          <Inner />
        </SearchQueryProvider>
      </Col>

      <Col xl={6} lg={9} md={9} sm={9} xs={9}>
        {route === 'account' ? (
          selectedWallet ? (
            <Boundary>
              <WalletInfo wallet={selectedWallet} />
            </Boundary>
          ) : (
            <div>No SelectedWallet</div>
          )
        ) : route === 'settings' ? (
          <SearchQueryProvider>
            <Settings />
          </SearchQueryProvider>
        ) : (
          <div>404</div>
        )}
      </Col>
    </Row>
  )
}

const Inner = () => {
  const route = useRoute()
  const setRoute = useSetRoute()
  const activeWalletIds = useActiveWalletIds(useAccount())
  const selectWallet = useSelectWallet()
  const setSearchQuery = useSetSearchQuery()

  return (
    <div>
      <FormControl placeholder={'Search'} onChange={(event) => setSearchQuery(event.currentTarget.value)} />
      <Boundary>
        <ActiveWalletList
          onSelect={(walletId: string) => {
            selectWallet(walletId)
            setRoute(Route.account)
          }}
        />
      </Boundary>

      <Boundary>
        <ArchivedWalletList />
      </Boundary>

      <Boundary>
        <DeletedWalletList />
      </Boundary>

      <Boundary>
        <CreateWallet key={activeWalletIds.length} />
      </Boundary>

      <Button onClick={() => setRoute(Route.settings)}>Settings</Button>
    </div>
  )
}
