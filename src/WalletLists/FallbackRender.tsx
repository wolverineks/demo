import { useChangeWalletState } from 'edge-react-hooks'
import * as React from 'react'
import { Button } from 'react-bootstrap'

import { useAccount } from '../Auth'

export const FallbackRender = ({ walletId }: { walletId: string }) => {
  const account = useAccount()
  const { execute: changeWalletState, status } = useChangeWalletState(account)
  const activateWallet = () => changeWalletState({ walletId, walletState: { archived: false, deleted: false } })

  return (
    <div>
      {walletId}{' '}
      <Button variant={'warning'} disabled={status === 'loading'} onClick={activateWallet}>
        Activate
      </Button>
    </div>
  )
}
