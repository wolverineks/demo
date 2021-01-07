import React from 'react'
import { Button, Container, Navbar } from 'react-bootstrap'
import { queryCache } from 'react-query'
import { ReactQueryDevtools } from 'react-query-devtools'

import { AccountConsumer, AccountProvider, Login, useEdgeAccount, useSetAccount } from './auth'
import { Boundary } from './components'
import { Edge } from './Edge'
import { AccountInfo } from './EdgeAccount'
import { useEdgeCurrencyWallet } from './hooks'
import { RouteProvider, useRoute } from './route'
import { SelectedWalletInfoProvider, useSelectedWalletInfo } from './SelectedWallet'

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
  const [walletInfo] = useSelectedWalletInfo()
  const route = useRoute()

  return (
    <Navbar>
      <Navbar.Brand>
        <img alt={'logo'} src={'../logo.jpg'} style={{ height: '70px' }} />
      </Navbar.Brand>
      <Navbar.Toggle />

      {walletInfo ? (
        <Boundary>
          <WalletName walletId={walletInfo.id} currencyCode={walletInfo.currencyCode} />
        </Boundary>
      ) : (
        <Navbar.Text>{route}</Navbar.Text>
      )}

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

const WalletName: React.FC<{ walletId: string; currencyCode: string }> = ({ walletId, currencyCode }) => {
  const wallet = useEdgeCurrencyWallet({ account: useEdgeAccount(), walletId })

  return (
    <Navbar.Text>
      {wallet.name}:{currencyCode}
    </Navbar.Text>
  )
}
