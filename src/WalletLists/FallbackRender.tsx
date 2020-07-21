import { useChangeWalletState } from 'edge-react-hooks'
import React from 'react'
import { Button } from 'react-bootstrap'

import { useAccount } from '../auth'

export const FallbackRender = ({ walletId }: { walletId: string }) => {
  const { execute: changeWalletState, status } = useChangeWalletState(useAccount())
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
