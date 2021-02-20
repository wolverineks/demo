import { EdgeCurrencyWallet, EdgeMetaToken } from 'edge-core-js'
import React from 'react'

import { Button, Form, FormControl } from '../../../components'
import { useTokens } from '../../../hooks'

export const AddToken = ({
  wallet,
  tokenInfo,
  onSuccess,
}: {
  wallet: EdgeCurrencyWallet
  tokenInfo?: EdgeMetaToken
  onSuccess: () => void
}) => {
  const [currencyName, setCurrencyName] = React.useState(tokenInfo?.currencyName || '')
  const [currencyCode, setCurrencyCode] = React.useState(tokenInfo?.currencyCode || '')
  const [contractAddress, setContractAddress] = React.useState(tokenInfo?.contractAddress || '')
  const [multiplier, setMultiplier] = React.useState(tokenInfo?.denominations[0].multiplier || '')

  const { addCustomInfo } = useTokens(wallet)

  const reset = () => {
    setCurrencyName('')
    setCurrencyCode('')
    setCurrencyCode('')
    setContractAddress('')
    setMultiplier('')
  }

  React.useEffect(() => {
    if (!tokenInfo) return

    setCurrencyName(tokenInfo?.currencyName || '')
    setCurrencyCode(tokenInfo?.currencyCode || '')
    setContractAddress(tokenInfo?.contractAddress || '')
    setMultiplier(tokenInfo?.denominations[0].multiplier || '')
  }, [tokenInfo])

  return (
    <Form>
      <Form.Group>
        <Form.Label>Token Name</Form.Label>
        <FormControl value={currencyName} onChange={(event) => setCurrencyName(event.currentTarget.value)} />
      </Form.Group>

      <Form.Group>
        <Form.Label>Token Code</Form.Label>
        <FormControl
          disabled={!!tokenInfo?.currencyCode}
          value={currencyCode}
          onChange={(event) => setCurrencyCode(event.currentTarget.value)}
        />
      </Form.Group>

      <Form.Group>
        <Form.Label>Contract Address</Form.Label>
        <FormControl value={contractAddress} onChange={(event) => setContractAddress(event.currentTarget.value)} />
      </Form.Group>

      <Form.Group>
        <Form.Label>Multiplier</Form.Label>
        <FormControl value={multiplier} onChange={(event) => setMultiplier(event.currentTarget.value)} />
      </Form.Group>

      <Form.Group>
        <Button
          onClick={() =>
            addCustomInfo({ currencyName, currencyCode, contractAddress, multiplier }).then(() => {
              onSuccess()
              setTimeout(reset, 1000)
            })
          }
        >
          Save
        </Button>
      </Form.Group>
    </Form>
  )
}
