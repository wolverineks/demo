import React from 'react'

import { Button } from '../components'
import { useChangeWalletState } from '../hooks'

export const FallbackRender = ({ walletId }: { walletId: string }) => {
  const { activateWallet, status } = useChangeWalletState(walletId)

  return (
    <div>
      {walletId}{' '}
      <Button variant={'warning'} disabled={status === 'loading'} onClick={activateWallet}>
        Activate
      </Button>
    </div>
  )
}
