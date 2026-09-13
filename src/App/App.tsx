import * as React from 'react'

import { AccountConsumer, AccountProvider, Login } from '../auth'
import { AutoLogoutProvider } from '../AutoLogout'
import { Boundary, Container } from '../components'
import { Edge } from '../Edge'
import { RouteProvider } from '../route'
import { SelectedWalletInfoProvider } from '../SelectedWallet'
import { Debug } from './Debug'
import { Header } from './Header'
import { Layout } from './Layout'

export const App = () => {
  return (
    <Boundary>
      <Edge>
        <AccountProvider>
          <AccountConsumer>
            {(account) =>
              account ? (
                <AutoLogoutProvider>
                  <SelectedWalletInfoProvider>
                    <RouteProvider>
                      <Header />

                      <Boundary>
                        <Layout />
                      </Boundary>
                    </RouteProvider>
                  </SelectedWalletInfoProvider>
                </AutoLogoutProvider>
              ) : (
                <Container style={{ top: '100px' }}>
                  <Login />
                </Container>
              )
            }
          </AccountConsumer>
        </AccountProvider>
        <Debug />
      </Edge>
    </Boundary>
  )
}
