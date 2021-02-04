import React from 'react'
import { Button, Image, Navbar } from 'react-bootstrap'

import { useEdgeAccount } from '../auth'
import { Boundary } from '../components'
import { useEdgeCurrencyWallet, useLogout, useName, useUsername } from '../hooks'
import { useSelectedWalletInfo } from '../SelectedWallet'

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
