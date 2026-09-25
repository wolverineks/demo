import { EdgeCurrencyWallet } from 'edge-core-js'
import React from 'react'

import { Button, Form, FormGroup } from '../../components'
import { useChangeWalletState } from '../../hooks'

export const WalletState: React.FC<{ wallet: EdgeCurrencyWallet }> = ({ wallet }) => {
  const { archiveWallet, deleteWallet, isLoading } = useChangeWalletState(wallet.id)

  return (
    <FormGroup>
      <Form.Label>Wallet State</Form.Label>
      <Button variant="warning" disabled={isLoading} onClick={archiveWallet}>
        Archive Wallet
      </Button>
      <Button variant="danger" disabled={isLoading} onClick={deleteWallet}>
        Delete Wallet
      </Button>
    </FormGroup>
  )
}
