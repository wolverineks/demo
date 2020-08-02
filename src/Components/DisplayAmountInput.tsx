import React from 'react'
import { FormControl, FormLabel } from 'react-bootstrap'

import { useAccount } from '../auth'
import { useDisplayDenomination } from '../hooks'

export const DisplayAmountInput = ({
  onChange,
  currencyCode,
  displayAmount,
}: {
  onChange: (displayAmount: string) => any
  currencyCode: string
  displayAmount: string
}) => {
  const [denomination] = useDisplayDenomination(useAccount(), currencyCode)

  return (
    <div>
      <FormLabel>
        Display Amount: {denomination.symbol} {denomination.name}
      </FormLabel>
      <FormControl value={displayAmount} onChange={(event) => onChange(event.currentTarget.value)} />
    </div>
  )
}
