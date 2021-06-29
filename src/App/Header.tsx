import React from 'react'

import { useEdgeAccount } from '../auth'
import { Button, Image, Navbar } from '../components'
import { useLogout, useName, useUsername } from '../hooks'
import { SelectedWalletBoundary, useSelectedWallet } from '../SelectedWallet'

export const Header = () => {
  const account = useEdgeAccount()
  const logout = useLogout()
  const username = useUsername(account)

  return (
    <Navbar>
      <Navbar.Brand>
        <Image alt={'logo'} src={'../logo.jpg'} style={{ height: 80, width: 80 }} />
      </Navbar.Brand>
      <Navbar.Toggle />

      <SelectedWalletBoundary fallback={<Navbar.Text>No Selected Wallet </Navbar.Text>}>
        <SelectedWalletName />
      </SelectedWalletBoundary>

      <Navbar.Collapse className="justify-content-end">
        <Navbar.Text>{username}</Navbar.Text>
        <Button variant={'warning'} onClick={() => logout()}>
          Logout
        </Button>
      </Navbar.Collapse>
    </Navbar>
  )
}

const SelectedWalletName: React.FC = () => {
  const [{ wallet, currencyCode }] = useSelectedWallet()
  const [name] = useName(wallet)

  return (
    <Navbar.Text>
      {name}:{currencyCode}
    </Navbar.Text>
  )
}
