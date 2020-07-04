import 'bootstrap/dist/css/bootstrap.min.css'

import * as React from 'react'
import { Button, Container, Navbar } from 'react-bootstrap'
import { ErrorBoundary } from 'react-error-boundary'
import { ReactQueryDevtools } from 'react-query-devtools'

import { useAccount, useSetAccount } from './Auth'
import { AccountProvider, Login } from './Auth'
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

      {!account || !account.loggedIn ? (
        <Login />
      ) : (
        <SelectedWalletProvider>
          <React.Suspense fallback={<div>Loading AccountInfo...</div>}>
            <AccountInfo account={account} key={account.id} />
          </React.Suspense>
        </SelectedWalletProvider>
      )}
    </Container>
  )
}

export const App = () => (
  <>
    <ErrorBoundary fallback={<div>Error...</div>}>
      <React.Suspense fallback={<div>Loading...</div>}>
        <Edge>
          <AccountProvider>
            <Inner />
          </AccountProvider>
        </Edge>
      </React.Suspense>
    </ErrorBoundary>
    <ReactQueryDevtools initialIsOpen={false} />
  </>
)
