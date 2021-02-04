import React from 'react'
import { Button, Container, Image, Navbar } from 'react-bootstrap'

import { AccountConsumer, AccountProvider, Login, useEdgeAccount } from './auth'
import { AutologoutProvider } from './AutoLogout'
import { Boundary } from './components'
import { Edge } from './Edge'
import { AccountInfo } from './EdgeAccount'
import { useEdgeCurrencyWallet, useLogout, useName, useUsername } from './hooks'
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
                <AutologoutProvider>
                  <SelectedWalletInfoProvider>
                    <RouteProvider>
                      <Header />

                      <Boundary>
                        <AccountInfo />
                      </Boundary>
                    </RouteProvider>
                  </SelectedWalletInfoProvider>
                </AutologoutProvider>
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
  const [walletInfo] = useSelectedWalletInfo()
  const logout = useLogout()
  const username = useUsername(account)

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
        <Navbar.Text>{username}</Navbar.Text>
        <Button variant={'warning'} onClick={() => logout()}>
          Logout
        </Button>
      </Navbar.Collapse>
    </Navbar>
  )
}

const WalletName: React.FC<{ walletId: string; currencyCode: string }> = ({ walletId, currencyCode }) => {
  const wallet = useEdgeCurrencyWallet({ account: useEdgeAccount(), walletId })
  const [name] = useName(wallet)

  return (
    <Navbar.Text>
      {name}:{currencyCode}
    </Navbar.Text>
  )
}
