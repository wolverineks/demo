import React from 'react'

import { useEdgeAccount } from '../auth'
import { Button, Image, Navbar } from '../components'
import { useLogout, useName, useUsername } from '../hooks'
import { SelectedWalletBoundary, useSelectedWallet } from '../SelectedWallet'
import { getCurrencyCodeFromTokenId } from '../utils'

export const Header = () => {
  const account = useEdgeAccount()
  const logout = useLogout()
  const username = useUsername(account)

  return (
    <Navbar className="app-header">
      <Navbar.Brand className="app-header__brand">
        <Image alt="Edge" src="/logo.jpg" className="app-header__logo" />
        <span className="app-header__title">Edge Hooks</span>
      </Navbar.Brand>

      <SelectedWalletBoundary fallback={<span className="app-header__wallet">No selected wallet</span>}>
        <SelectedWalletName />
      </SelectedWalletBoundary>

      <div className="app-header__user">
        <Navbar.Text>{username}</Navbar.Text>
        <Button size="sm" variant="outline-secondary" onClick={() => logout()}>
          Logout
        </Button>
      </div>
    </Navbar>
  )
}

const SelectedWalletName: React.FC = () => {
  const [{ wallet, tokenId }] = useSelectedWallet()
  const [name] = useName(wallet)
  const currencyCode = getCurrencyCodeFromTokenId(wallet, tokenId)

  return (
    <span className="app-header__wallet">
      {name} · {currencyCode}
    </span>
  )
}
