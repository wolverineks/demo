import { EdgeCurrencyWallet } from 'edge-core-js'
import React from 'react'

import { useEdgeAccount } from '../../auth'
import { Button, FormControl, FormGroup, FormLabel } from '../../components'

export const PrivateSeed: React.FC<{ wallet: EdgeCurrencyWallet }> = ({ wallet }) => {
  const account = useEdgeAccount()
  const [showPrivateSeed, setShowPrivateSeed] = React.useState(false)
  const [privateSeed, setPrivateSeed] = React.useState('')

  React.useEffect(() => {
    if (!showPrivateSeed) return
    account.getDisplayPrivateKey(wallet.id).then(setPrivateSeed).catch(() => setPrivateSeed(''))
  }, [account, showPrivateSeed, wallet.id])

  return (
    <FormGroup>
      <FormLabel>Private Seed</FormLabel>
      <FormControl readOnly value={showPrivateSeed ? privateSeed : ''} />
      <Button onClick={() => setShowPrivateSeed((x) => !x)}>Show Private Seed</Button>
    </FormGroup>
  )
}
