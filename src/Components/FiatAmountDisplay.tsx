import React from 'react'
import { FormControl, FormLabel } from 'react-bootstrap'

import { useAccount } from '../auth'
import { getFiatInfo } from '../Fiat'
import { useFiatAmount } from '../hooks'

export const FiatAmountDisplay = ({
  fiatCurrencyCode,
  nativeAmount,
  currencyCode,
}: {
  fiatCurrencyCode: string
  nativeAmount: string
  currencyCode: string
}) => {
  const fiatAmount = useFiatAmount({
    account: useAccount(),
    nativeAmount,
    fiatCurrencyCode,
    fromCurrencyCode: currencyCode,
  })
  const fiatInfo = getFiatInfo(fiatCurrencyCode)

  return (
    <div>
      <FormLabel>
        Fiat Amount: {fiatInfo.symbol} {fiatInfo.currencyCode}
      </FormLabel>
      <FormControl readOnly value={fiatAmount?.toFixed(2) || '0.00'} />
    </div>
  )
}
