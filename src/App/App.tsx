import * as React from 'react'

import { AccountConsumer, AccountProvider, Login } from '../auth'
import { AutoLogoutProvider } from '../AutoLogout'
import { Boundary } from '../components'
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
                      <div className="app-shell">
                        <Header />

                        <Boundary>
                          <Layout />
                        </Boundary>
                      </div>
                    </RouteProvider>
                  </SelectedWalletInfoProvider>
                </AutoLogoutProvider>
              ) : (
                <div className="login-shell">
                  <div className="login-card">
                    <img className="login-brand" src="/logo.jpg" alt="Edge" />
                    <Login />
                  </div>
                </div>
              )
            }
          </AccountConsumer>
        </AccountProvider>
        <Debug />
      </Edge>
    </Boundary>
  )
}
