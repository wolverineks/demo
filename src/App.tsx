import 'bootstrap/dist/css/bootstrap.min.css'

import React from 'react'
import { Button, Container, Navbar } from 'react-bootstrap'
import { ReactQueryDevtools } from 'react-query-devtools'

import { AccountProvider, Login, useAccount, useSetAccount } from './auth'
import { Boundary } from './components'
import { Edge } from './Edge'
import { AccountInfo } from './EdgeAccount/AccountInfo'
import { SelectedWalletProvider } from './SelectedWallet'

const Header = () => {
  const account = useAccount()
  const setAccount = useSetAccount()

  return (
    <Navbar>
      <Navbar.Brand>Edge</Navbar.Brand>
      <Navbar.Toggle />
      <Navbar.Collapse className="justify-content-end">
        {account && account.loggedIn && <Navbar.Text>{account.username}</Navbar.Text>}
        {account && account.loggedIn && (
          <Button
            variant={'warning'}
            onClick={() => {
              setAccount(undefined)
              account.logout()
            }}
          >
            Logout
          </Button>
        )}
      </Navbar.Collapse>
    </Navbar>
  )
}

export const App = () => {
  return (
    <>
      <Boundary>
        <Edge>
          <AccountProvider>
            <Boundary
              error={{
                // eslint-disable-next-line react/display-name
                fallbackRender: ({ resetErrorBoundary }) => (
                  <Container style={{ top: '100px' }}>
                    <Login onLogin={resetErrorBoundary} />
                  </Container>
                ),
              }}
            >
              <Container>
                <Boundary catch={false}>
                  <Header />
                </Boundary>

                <Boundary catch={false}>
                  <SelectedWalletProvider>
                    <AccountInfo />
                  </SelectedWalletProvider>
                </Boundary>
              </Container>
            </Boundary>
          </AccountProvider>
        </Edge>
      </Boundary>
      <ReactQueryDevtools initialIsOpen />
    </>
  )
}
