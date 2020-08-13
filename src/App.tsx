import 'bootstrap/dist/css/bootstrap.min.css'

import React from 'react'
import { Button, Container, Navbar } from 'react-bootstrap'
import { queryCache } from 'react-query'
import { ReactQueryDevtools } from 'react-query-devtools'

import { AccountConsumer, AccountProvider, Login, useAccount, useSetAccount } from './auth'
import { Boundary } from './components'
import { Edge } from './Edge'
import { AccountInfo } from './EdgeAccount'
import { useName } from './hooks'
import { RouteProvider, useRoute } from './route'
import { SelectedWalletInfoProvider, fallbackRender, useSelectedWallet } from './SelectedWallet'

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
                      <div>
                        <Header />
                        <Boundary>
                          <AccountInfo />
                        </Boundary>
                      </div>
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
  const account = useAccount()
  const setAccount = useSetAccount()

  return (
    <Navbar>
      <Navbar.Brand>
        <img alt={'logo'} src={'../logo.jpg'} style={{ height: '70px' }} />
      </Navbar.Brand>
      <Navbar.Toggle />

      <Boundary error={{ fallbackRender: fallbackRender(<RouteText />) }}>
        <SelectedWalletName />
      </Boundary>

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
  const name = useName(selected.wallet)

  return (
    <Navbar.Text>
      {name}:{selected.currencyCode}
    </Navbar.Text>
  )
}
const RouteText = () => <Navbar.Text>{useRoute()}</Navbar.Text>
