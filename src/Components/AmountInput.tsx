import { EdgeDenomination } from 'edge-core-js'
import React from 'react'
import { FormControl, InputGroup } from 'react-bootstrap'

export const AmountInput = ({
  onChange,
  amount,
  denomination,
}: {
  onChange: (amount: string) => any
  amount: string
  denomination: EdgeDenomination
}) => (
  <InputGroup>
    <InputGroup.Prepend>
      <InputGroup.Text>{denomination.symbol}</InputGroup.Text>
    </InputGroup.Prepend>
    <FormControl value={amount} onChange={(event) => onChange(event.currentTarget.value)} />
    <InputGroup.Append>
      <InputGroup.Text>{denomination.name}</InputGroup.Text>
    </InputGroup.Append>
  </InputGroup>
)
