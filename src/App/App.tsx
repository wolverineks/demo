import React from 'react'
import { Container } from 'react-bootstrap'

import { AccountConsumer, AccountProvider, Login } from '../auth'
import { AutologoutProvider } from '../AutoLogout'
import { Boundary } from '../components'
import { Edge } from '../Edge'
import { RouteProvider } from '../route'
import { SelectedWalletInfoProvider } from '../SelectedWallet'
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
                <AutologoutProvider>
                  <SelectedWalletInfoProvider>
                    <RouteProvider>
                      <Header />

                      <Boundary>
                        <Layout />
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
