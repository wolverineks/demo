import React from 'react'
import { Col, FormControl, ListGroup, Row } from 'react-bootstrap'

import { useAccount } from '../auth'
import { Boundary, DisplayAmount, Logo } from '../components'
import { WalletInfo } from '../EdgeCurrencyWallet'
import { FiatAmount } from '../Fiat'
import { useAccountTotal, useActiveCurrencyInfos, useDefaultFiatCurrencyCode } from '../hooks'
import { Route, useRoute, useSetRoute } from '../route'
import { SearchQueryProvider, useSetSearchQuery } from '../search'
import { SelectedWalletBoundary, useSelectedWallet } from '../SelectedWallet'
import { Settings } from '../Settings/Settings'
import { denominatedToNative, getExchangeDenomination } from '../utils'
import { ActiveWalletList, ArchivedWalletList, DeletedWalletList } from '../WalletLists'
import { CreateWallet } from '.'

export const AccountInfo = () => {
  const route = useRoute()
  const account = useAccount()

  return (
    <Row>
      <Col xl={3} lg={3} md={3} sm={3}>
        <SearchQueryProvider>
          <SideMenu />
        </SearchQueryProvider>
      </Col>

      <Col>
        {route === Route.account ? (
          <SelectedWalletBoundary fallback={<div>No Selected Wallet</div>}>
            <SelectedWalletInfo />
          </SelectedWalletBoundary>
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

      <Col xl={3} lg={3} md={3} sm={3}>
        <ExchangeRates />
      </Col>
    </Row>
  )
}

const ExchangeRates = () => {
  const [searchQuery, setSearchQuery] = React.useState('')
  const currencyCodes = useActiveCurrencyInfos(useAccount())
    .reduce(
      (result, current) => [
        ...result,
        current.currencyCode,
        ...current.metaTokens.map(({ currencyCode }) => currencyCode),
      ],
      [] as string[],
    )
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
  const account = useAccount()
  const [fiatCurrencyCode] = useDefaultFiatCurrencyCode(account)
  const exchangeDenomiation = getExchangeDenomination(account, currencyCode)
  const nativeAmount = denominatedToNative({ denomination: exchangeDenomiation, amount: '1' })

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

  return selected ? (
    <WalletInfo wallet={selected.wallet} currencyCode={selected.currencyCode} />
  ) : (
    <div>No Selected Wallet</div>
  )
}

const AccountTotal = () => {
  const {
    total,
    denomination: { symbol, name },
  } = useAccountTotal(useAccount())

  return (
    <ListGroup.Item>
      Account Total: {symbol} {total.toFixed(2)} {name}
    </ListGroup.Item>
  )
}

const SideMenu = () => {
  const route = useRoute()
  const setRoute = useSetRoute()
  const setSearchQuery = useSetSearchQuery()

  return (
    <div>
      <FormControl placeholder={'Search'} onChange={(event) => setSearchQuery(event.currentTarget.value)} />

      <Boundary>
        <AccountTotal />
      </Boundary>

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
