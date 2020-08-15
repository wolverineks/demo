import 'bootstrap/dist/css/bootstrap.min.css'

import React from 'react'
import { Button, Container, Navbar } from 'react-bootstrap'
import { queryCache } from 'react-query'
import { ReactQueryDevtools } from 'react-query-devtools'

import { AccountConsumer, AccountProvider, Login, useEdgeAccount, useSetAccount } from './auth'
import { Boundary } from './components'
import { Edge } from './Edge'
import { AccountInfo } from './EdgeAccount'
import { RouteProvider, useRoute } from './route'
import { SelectedWalletBoundary, SelectedWalletInfoProvider, useSelectedWallet } from './SelectedWallet'

export const App = () => {
  return (
    <>
      <Boundary>
        <Edge>
          <AccountProvider>
            <AccountConsumer>
              {(account) =>
                account ? (
                  <SelectedWalletInfoProvider>
                    <RouteProvider>
                      <Header />

                      <Boundary>
                        <AccountInfo />
                      </Boundary>
                    </RouteProvider>
                  </SelectedWalletInfoProvider>
                ) : (
                  <Container style={{ top: '100px' }}>
                    <Login />
                  </Container>
                )
              }
            </AccountConsumer>
          </AccountProvider>
        </Edge>
      </Boundary>
      <ReactQueryDevtools initialIsOpen />
    </>
  )
}

export const Header = () => {
  const account = useEdgeAccount()
  const setAccount = useSetAccount()

  return (
    <Navbar>
      <Navbar.Brand>
        <img alt={'logo'} src={'../logo.jpg'} style={{ height: '70px' }} />
      </Navbar.Brand>
      <Navbar.Toggle />

      <SelectedWalletBoundary fallback={<Navbar.Text>{useRoute()}</Navbar.Text>}>
        <Boundary>
          <SelectedWalletName />
        </Boundary>
      </SelectedWalletBoundary>

      <Navbar.Collapse className="justify-content-end">
        <Navbar.Text>{account.username}</Navbar.Text>
        <Button
          variant={'warning'}
          onClick={() => {
            setAccount(undefined)
            account.logout()
            queryCache.removeQueries(({ queryKey }) => queryKey[0] !== 'context')
          }}
        >
          Logout
        </Button>
      </Navbar.Collapse>
    </Navbar>
  )
}

const SelectedWalletName = () => {
  const [selected] = useSelectedWallet()

  return (
    <Navbar.Text>
      {selected.wallet.name}:{selected.currencyCode}
    </Navbar.Text>
  )
}
