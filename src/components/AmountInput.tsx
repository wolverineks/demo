import { EdgeDenomination } from 'edge-core-js'
import React from 'react'

import { FormControl, InputGroup } from '../components'

export const AmountInput = ({
  onChange,
  amount,
  denomination,
  className,
}: {
  onChange: (amount: string) => any
  amount: string
  denomination: EdgeDenomination
  className?: string
}) => (
  <InputGroup className={className}>
    <InputGroup.Prepend>
      <InputGroup.Text>{denomination.symbol}</InputGroup.Text>
    </InputGroup.Prepend>
    <FormControl
      inputMode="decimal"
      value={amount}
      onChange={(event) => onChange(event.currentTarget.value)}
    />
    <InputGroup.Append>
      <InputGroup.Text>{denomination.name}</InputGroup.Text>
    </InputGroup.Append>
  </InputGroup>
)
