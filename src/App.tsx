import 'bootstrap/dist/css/bootstrap.min.css'

import * as React from 'react'
import { Button, Container, Navbar } from 'react-bootstrap'
import { ReactQueryDevtools } from 'react-query-devtools'

import { useAccount, useSetAccount } from './Auth'
import { AccountProvider, Login } from './Auth'
import { Boundary } from './Components/Boundary'
import { Edge } from './Edge'
import { AccountInfo } from './EdgeAccount/AccountInfo'
import { SelectedWalletProvider } from './SelectedWallet'

export const Inner = () => {
  const account = useAccount()
  const setAccount = useSetAccount()

  return (
    <Container>
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

      <SelectedWalletProvider>
        <AccountInfo />
      </SelectedWalletProvider>
    </Container>
  )
}

export const App = () => (
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
            <Inner />
          </Boundary>
        </AccountProvider>
      </Edge>
    </Boundary>
    <ReactQueryDevtools initialIsOpen={false} />
  </>
)
