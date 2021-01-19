import { EdgeCurrencyWallet } from 'edge-core-js'
import React from 'react'
import { Button, Form, FormControl, FormGroup } from 'react-bootstrap'

import { useRenameWallet } from '../hooks'

export const RenameWallet: React.FC<{ wallet: EdgeCurrencyWallet }> = ({ wallet }) => {
  const [name, setName] = React.useState<string>(wallet.name || '')
  const { mutate: renameWallet, status } = useRenameWallet(wallet)

  return (
    <FormGroup>
      <Form.Label>Wallet Name</Form.Label>
      <FormControl value={name} onChange={(event) => setName(event.currentTarget.value)} />
      <Button onClick={() => renameWallet({ name })} disabled={status === 'loading'}>
        Rename
      </Button>
    </FormGroup>
  )
}
