import { EdgeTransaction } from 'edge-core-js'
import React from 'react'

import { useEdgeAccount } from '../../auth'
import { Boundary } from '../../components'
import { nativeToDenominated, useDisplayDenomination, useExchangeToNative } from '../../hooks'

export const Metadata = ({ metadata }: { metadata: NonNullable<EdgeTransaction['metadata']> }) => {
  return (
    <div>
      <div>Name: {metadata.name}</div>
      <div>Category: {metadata.category}</div>
      <div>Notes: {metadata.notes}</div>
      <div>Exchange Amounts:</div>
      {metadata.exchangeAmount && <ExchangeAmounts exchangeAmounts={metadata.exchangeAmount} />}
    </div>
  )
}

const ExchangeAmounts = ({
  exchangeAmounts,
}: {
  exchangeAmounts: NonNullable<NonNullable<EdgeTransaction['metadata']>['exchangeAmount']>
}) => {
  return (
    <>
      {Object.entries(exchangeAmounts).map(([currencyCode, exchangeAmount]) => (
        <Boundary key={currencyCode}>
          <ExchangeAmount currencyCode={currencyCode} exchangeAmount={exchangeAmount} />
        </Boundary>
      ))}
    </>
  )
}

const ExchangeAmount: React.FC<{ currencyCode: string; exchangeAmount: number | string }> = ({
  currencyCode,
  exchangeAmount,
}) => {
  const account = useEdgeAccount()
  const displayDenomination = useDisplayDenomination(account, currencyCode)[0]
  const displayAmount = nativeToDenominated({
    nativeAmount: useExchangeToNative({ account, currencyCode, exchangeAmount: String(exchangeAmount) }),
    denomination: displayDenomination,
  })

  return (
    <div>
      {displayDenomination.symbol} {Number(displayAmount).toFixed(2)} {displayDenomination.name}
    </div>
  )
}
