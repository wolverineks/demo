import { EdgeCurrencyInfo, EdgeMetaToken } from 'edge-core-js'
import * as React from 'react'

import { useAccount } from '../auth'
import { useDisplayDenomination } from '../hooks'
import { nativeToDenomination } from '../utils/utils'

export const DisplayAmount = ({
  nativeAmount,
  currencyInfo,
}: {
  nativeAmount: string
  currencyInfo: EdgeCurrencyInfo | EdgeMetaToken
}) => {
  const account = useAccount()
  const [denomination] = useDisplayDenomination({
    account,
    currencyInfo,
  })

  return (
    <>
      {denomination.symbol} {nativeToDenomination({ denomination, nativeAmount })} {denomination.name}
    </>
  )
}
