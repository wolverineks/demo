import { EdgeCurrencyWallet } from 'edge-core-js'
import React from 'react'

import { useEdgeAccount } from '../../auth'
import { Button, FormControl, FormGroup, FormLabel } from '../../components'

export const PublicSeed: React.FC<{ wallet: EdgeCurrencyWallet }> = ({ wallet }) => {
  const account = useEdgeAccount()
  const [showPublicSeed, setShowPublicSeed] = React.useState(false)
  const [publicSeed, setPublicSeed] = React.useState('')

  React.useEffect(() => {
    if (!showPublicSeed) return
    account.getDisplayPublicKey(wallet.id).then(setPublicSeed).catch(() => setPublicSeed(''))
  }, [account, showPublicSeed, wallet.id])

  return (
    <FormGroup>
      <FormLabel>Public Seed</FormLabel>
      <FormControl readOnly value={showPublicSeed ? publicSeed : ''} />
      <Button onClick={() => setShowPublicSeed((x) => !x)}>Show Public Seed</Button>
    </FormGroup>
  )
}
