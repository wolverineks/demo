import { EdgeCurrencyWallet } from 'edge-core-js'
import React from 'react'
import { Button, FormControl, FormGroup, FormLabel } from 'react-bootstrap'

export const PrivateSeed: React.FC<{ wallet: EdgeCurrencyWallet }> = ({ wallet }) => {
  const [showPrivateSeed, setShowPrivateSeed] = React.useState(false)

  return (
    <FormGroup>
      <FormLabel>Private Seed</FormLabel>
      <FormControl readOnly value={showPrivateSeed ? wallet.getDisplayPrivateSeed() || '' : ''} />
      <Button onClick={() => setShowPrivateSeed((x) => !x)}>Show Private Seed</Button>
    </FormGroup>
  )
}
