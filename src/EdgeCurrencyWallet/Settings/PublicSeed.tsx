import { EdgeCurrencyWallet } from 'edge-core-js'
import React from 'react'

import { Button, FormControl, FormGroup, FormLabel } from '../../components'

export const PublicSeed: React.FC<{ wallet: EdgeCurrencyWallet }> = ({ wallet }) => {
  const [showPublicSeed, setShowPublicSeed] = React.useState(false)

  return (
    <FormGroup>
      <FormLabel>Public Seed</FormLabel>
      <FormControl readOnly value={showPublicSeed ? wallet.getDisplayPublicSeed() || '' : ''} />
      <Button onClick={() => setShowPublicSeed((x) => !x)}>Show Public Seed</Button>
    </FormGroup>
  )
}
