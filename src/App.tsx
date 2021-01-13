import React from 'react'
import { Button, Container, Image, Navbar } from 'react-bootstrap'
import { useQueryClient } from 'react-query'

import { AccountConsumer, AccountProvider, Login, useEdgeAccount, useSetAccount } from './auth'
import { Boundary } from './components'
import { Edge } from './Edge'
import { AccountInfo } from './EdgeAccount'
import { useEdgeCurrencyWallet } from './hooks'
import { RouteProvider } from './route'
import { SelectedWalletInfoProvider, useSelectedWalletInfo } from './SelectedWallet'

export const App = () => {
  return (
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
  )
}

export const Header = () => {
  const account = useEdgeAccount()
  const setAccount = useSetAccount()
  const [walletInfo] = useSelectedWalletInfo()
  const queryClient = useQueryClient()

  return (
    <Navbar>
      <Navbar.Brand>
        <Image alt={'logo'} src={'../logo.jpg'} style={{ height: 80, width: 80 }} />
      </Navbar.Brand>
      <Navbar.Toggle />

      {walletInfo ? (
        <Boundary>
          <WalletName walletId={walletInfo.id} currencyCode={walletInfo.currencyCode} />
        </Boundary>
      ) : (
        <Navbar.Text>No Selected Wallet </Navbar.Text>
      )}

      <Navbar.Collapse className="justify-content-end">
        <Navbar.Text>{account.username}</Navbar.Text>
        <Button
          variant={'warning'}
          onClick={() => {
            setAccount(undefined)
            account.logout()
            queryClient.removeQueries({ predicate: ({ queryKey }) => queryKey[0] !== 'context' })
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
