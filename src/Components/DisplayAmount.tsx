import { EdgeCurrencyInfo, EdgeMetaToken } from 'edge-core-js'
import React from 'react'

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
  const [denomination] = useDisplayDenomination(useAccount(), currencyInfo)

  return (
    <>
      {denomination.symbol} {nativeToDenomination({ denomination, nativeAmount })} {denomination.name}
    </>
  )
}
