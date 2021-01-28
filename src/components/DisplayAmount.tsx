import React from 'react'

import { useEdgeAccount } from '../auth'
import { useDisplayAmount } from '../hooks'

export const DisplayAmount = ({ nativeAmount, currencyCode }: { nativeAmount: string; currencyCode: string }) => {
  const account = useEdgeAccount()
  const { name, symbol, amount } = useDisplayAmount({ account, currencyCode, nativeAmount })

  return (
    <>
      {symbol} {amount} {name}
    </>
  )
}
