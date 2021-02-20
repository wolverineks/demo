import { EdgeCurrencyWallet } from 'edge-core-js'
import React from 'react'
import JSONPretty from 'react-json-pretty'

import { useEdgeAccount } from '../../auth'
import { Button, FormGroup, FormLabel } from '../../components'

export const RawKey: React.FC<{ wallet: EdgeCurrencyWallet }> = ({ wallet }) => {
  const [showRawKey, setShowRawKey] = React.useState(false)
  const rawKey = useEdgeAccount().allKeys.find(({ id }) => id === wallet.id)!

  return (
    <FormGroup>
      <FormLabel>Raw Key</FormLabel>
      {showRawKey && <JSONPretty json={rawKey} />}
      <br />
      <Button onClick={() => setShowRawKey((x) => !x)}>Show Raw Key</Button>
    </FormGroup>
  )
}
