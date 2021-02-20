import React from 'react'

import { useEdgeAccount } from '../auth'
import { Button } from '../components'
import { useChangeWalletState } from '../hooks'

export const FallbackRender = ({ walletId }: { walletId: string }) => {
  const account = useEdgeAccount()
  const { activateWallet, status } = useChangeWalletState(account, walletId)

  return (
    <div>
      {walletId}{' '}
      <Button variant={'warning'} disabled={status === 'loading'} onClick={activateWallet}>
        Activate
      </Button>
    </div>
  )
}
