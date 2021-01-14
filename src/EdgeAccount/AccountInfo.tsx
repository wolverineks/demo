import React from 'react'
import { Col, FormControl, ListGroup, Row } from 'react-bootstrap'

import { useEdgeAccount } from '../auth'
import { Boundary, DisplayAmount, Logo } from '../components'
import { WalletInfo } from '../EdgeCurrencyWallet'
import { FiatAmount } from '../Fiat'
import { useActiveInfos, useDefaultFiatCurrencyCode, useDisplayToNative, useEdgeAccountTotal } from '../hooks'
import { Route, useRoute, useSetRoute } from '../route'
import { SelectedWalletBoundary, useSelectedWallet } from '../SelectedWallet'
import { Settings } from '../Settings/Settings'
import { isUnique } from '../utils'
import { ActiveWalletList, ArchivedWalletList, DeletedWalletList } from '../WalletLists'
import { CreateWallet } from '.'

export const AccountInfo = () => {
  const route = useRoute()
  const account = useEdgeAccount()

  return (
    <Row>
      <Col xl={3} lg={3} md={3} sm={3}>
        <SideMenu />
      </Col>

      <Col>
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
      </Col>

      <Col xl={3} lg={3} md={3} sm={3}>
        <Boundary>
          <ExchangeRates />
        </Boundary>
      </Col>
    </Row>
  )
}

const watch = ['currencyWallets'] as const
const requiredExchangeRates = ['BTC', 'BCH', 'LTC', 'ETH']
const ExchangeRates = () => {
  const [searchQuery, setSearchQuery] = React.useState('')
  const currencyCodes = useActiveInfos(useEdgeAccount(watch))
    .reduce((result, current) => [...result, current.currencyCode], requiredExchangeRates as string[])
    .filter(isUnique)
    .filter((currencyCode) => currencyCode.toLowerCase().trim().includes(searchQuery.toLowerCase().trim()))

  return (
    <div>
      <div>Exchange Rates</div>

      <FormControl
        placeholder={'Search'}
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.currentTarget.value)}
      />

      {currencyCodes.map((currencyCode) => (
        <Boundary key={currencyCode}>
          <ExchangeRate key={currencyCode} currencyCode={currencyCode} />
        </Boundary>
      ))}
    </div>
  )
}

const ExchangeRate: React.FC<{ currencyCode: string }> = ({ currencyCode }) => {
  const account = useEdgeAccount()
  const [fiatCurrencyCode] = useDefaultFiatCurrencyCode(account)
  const nativeAmount = useDisplayToNative({ account, displayAmount: '1', currencyCode })

  return (
    <div>
      <Logo currencyCode={currencyCode} />
      <DisplayAmount nativeAmount={nativeAmount} currencyCode={currencyCode} /> ={' '}
      <FiatAmount nativeAmount={nativeAmount} fromCurrencyCode={currencyCode} fiatCurrencyCode={fiatCurrencyCode} />
    </div>
  )
}

const SelectedWalletInfo = () => {
  const [selected] = useSelectedWallet()

  return <WalletInfo wallet={selected.wallet} currencyCode={selected.currencyCode} />
}

const AccountTotal = () => {
  const {
    total,
    denomination: { symbol, name },
  } = useEdgeAccountTotal(useEdgeAccount())

  return (
    <ListGroup.Item>
      Account Total: {symbol} {total.toFixed(2)} {name}
    </ListGroup.Item>
  )
}

const SideMenu = () => {
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
