import React from 'react'
import { Button } from 'react-bootstrap'

import { useEdgeAccount } from '../auth'
import { useChangeWalletStates } from '../hooks'

export const FallbackRender = ({ walletId }: { walletId: string }) => {
  const account = useEdgeAccount()
  const { activateWallet, status } = useChangeWalletStates(account)

  return (
    <div>
      {walletId}{' '}
      <Button variant={'warning'} disabled={status === 'loading'} onClick={() => activateWallet(walletId)}>
        Activate
      </Button>
    </div>
  )
}
