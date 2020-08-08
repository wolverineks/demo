import 'bootstrap/dist/css/bootstrap.min.css'

import React from 'react'
import { Button, Container, Image, Navbar } from 'react-bootstrap'
import { queryCache } from 'react-query'
import { ReactQueryDevtools } from 'react-query-devtools'

import { AccountConsumer, AccountProvider, Login, useAccount, useSetAccount } from './auth'
import { Boundary } from './components'
import { Edge } from './Edge'
import { AccountInfo } from './EdgeAccount'
import { RouteProvider } from './route'
import { SelectedWalletProvider, useSelectedWallet } from './SelectedWallet'

export const App = () => {
  return (
    <>
      <Boundary>
        <Edge>
          <AccountProvider>
            <SelectedWalletProvider>
              <AccountConsumer>
                {(account) =>
                  account ? (
                    <RouteProvider>
                      <div>
                        <Boundary>
                          <Header />
                        </Boundary>
                        <Boundary>
                          <AccountInfo />
                        </Boundary>
                      </div>
                    </RouteProvider>
                  ) : (
                    <Container style={{ top: '100px' }}>
                      <Login />
                    </Container>
                  )
                }
              </AccountConsumer>
            </SelectedWalletProvider>
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
  const selectedWallet = useSelectedWallet()

  return (
    <Navbar>
      <Navbar.Brand>
        <img src={'../logo.jpg'} style={{ height: '70px' }} />
      </Navbar.Brand>
      <Navbar.Toggle />

      <Navbar.Text>{selectedWallet.name}</Navbar.Text>

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
