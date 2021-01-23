import React from 'react'
import { FormControl } from 'react-bootstrap'

import { useEdgeAccount } from '../auth'
import { Boundary, DisplayAmount, FiatAmount, Logo } from '../components'
import { useActiveInfos, useDefaultFiatCurrencyCode, useDisplayToNative } from '../hooks'
import { isUnique } from '../utils'

const requiredExchangeRates = ['BTC', 'BCH', 'LTC', 'ETH']
export const ExchangeRates = () => {
  const [searchQuery, setSearchQuery] = React.useState('')
  const account = useEdgeAccount()
  const currencyCodes = useActiveInfos(account)
    .reduce((result, current) => [...result, current.currencyCode], requiredExchangeRates as string[])
    .filter(isUnique)
  const visibleCurrencyCodes = currencyCodes.filter((currencyCode) =>
    currencyCode.toLowerCase().trim().includes(searchQuery.toLowerCase().trim()),
  )

  return (
    <div>
      <div>Exchange Rates</div>

      <FormControl
        placeholder={'Search'}
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.currentTarget.value)}
      />

      {visibleCurrencyCodes.map((currencyCode) => (
        <Boundary key={currencyCode}>
          <ExchangeRate key={currencyCode} currencyCode={currencyCode} />
        </Boundary>
      ))}
    </div>
  )
}

const ExchangeRate: React.FC<{ currencyCode: string }> = ({ currencyCode }) => {
  const account = useEdgeAccount()
  const [fiatCurrencyCode] = useDefaultFiatCurrencyCode(account)
  const nativeAmount = useDisplayToNative({ account, displayAmount: '1', currencyCode })

  return (
    <div style={{ paddingTop: 8, paddingBottom: 8 }}>
      <Logo currencyCode={currencyCode} />

      <Boundary>
        <DisplayAmount nativeAmount={nativeAmount} currencyCode={currencyCode} /> ={' '}
      </Boundary>

      <Boundary>
        <FiatAmount nativeAmount={nativeAmount} fromCurrencyCode={currencyCode} fiatCurrencyCode={fiatCurrencyCode} />
      </Boundary>
    </div>
  )
}
