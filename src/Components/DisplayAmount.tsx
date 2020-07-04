import { EdgeAccount, EdgeCurrencyInfo, EdgeMetaToken } from 'edge-core-js'
import * as React from 'react'

import { useDisplayDenomination } from '../utils/useDisplayDenomination'
import { nativeToDenomination } from '../utils/utils'

export const DisplayAmount = ({
  account,
  nativeAmount,
  currencyInfo,
}: {
  account: EdgeAccount
  nativeAmount: string
  currencyInfo: EdgeCurrencyInfo | EdgeMetaToken
}) => {
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
