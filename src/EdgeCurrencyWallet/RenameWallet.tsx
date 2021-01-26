import { EdgeCurrencyWallet } from 'edge-core-js'
import React from 'react'
import { Button, Form, FormControl, FormGroup } from 'react-bootstrap'

import { useName } from '../hooks'

export const RenameWallet: React.FC<{ wallet: EdgeCurrencyWallet }> = ({ wallet }) => {
  const [name, rename] = useName(wallet)
  const [_name, setName] = React.useState<string>(name || '')

  return (
    <FormGroup>
      <Form.Label>Wallet Name</Form.Label>
      <FormControl value={_name} onChange={(event) => setName(event.currentTarget.value)} />
      <Button onClick={() => rename({ name: _name })}>Rename</Button>
    </FormGroup>
  )
}
