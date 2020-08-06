import React from 'react'

import { useAccount } from '../auth'
import { useDisplayAmount } from '../hooks'

export const DisplayAmount = ({ nativeAmount, currencyCode }: { nativeAmount: string; currencyCode: string }) => {
  const { name, symbol, amount } = useDisplayAmount({ account: useAccount(), currencyCode, nativeAmount })

  return (
    <>
      {symbol} {amount} {name}
    </>
  )
}
