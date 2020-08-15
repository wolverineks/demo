import React from 'react'
import { Button } from 'react-bootstrap'

import { useAccount } from '../auth'
import { useChangeWalletStates } from '../hooks'

export const FallbackRender = ({ walletId }: { walletId: string }) => {
  const { activateWallet, status } = useChangeWalletStates(useAccount())

  return (
    <div>
      {walletId}{' '}
      <Button variant={'warning'} disabled={status === 'loading'} onClick={() => activateWallet(walletId)}>
        Activate
      </Button>
    </div>
  )
}
