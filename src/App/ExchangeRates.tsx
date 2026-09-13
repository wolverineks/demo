import React from 'react'

import { useEdgeAccount } from '../auth'
import { Boundary, DisplayAmount, FiatAmount, FormControl, Logo } from '../components'
import { useActiveCurrencyCodes, useDefaultFiatCurrencyCode, useDisplayToNative } from '../hooks'

export const ExchangeRates = () => {
  const [searchQuery, setSearchQuery] = React.useState('')
  const account = useEdgeAccount()
  const currencyCodes = useActiveCurrencyCodes(account)

  const visibleCurrencyCodes = currencyCodes.filter((currencyCode) =>
    currencyCode.toLowerCase().trim().includes(searchQuery.toLowerCase().trim()),
  )

  return (
    <div>
      <div className="panel-title">Exchange Rates</div>

      <FormControl
        placeholder={'Search'}
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.currentTarget.value)}
      />

      {visibleCurrencyCodes.map((currencyCode) => (
        <Boundary
          key={currencyCode}
          error={{
            fallbackRender: () => (
              <div className="rate-row">
                <span>{currencyCode}</span>
              </div>
            ),
          }}
        >
          <ExchangeRate currencyCode={currencyCode} />
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
    <div className="rate-row">
      <Boundary error={{ fallback: null }} suspense={{ fallback: null }}>
        <Logo currencyCode={currencyCode} />
      </Boundary>
      <span>
        <Boundary error={{ fallback: <span>{currencyCode}</span> }}>
          <DisplayAmount nativeAmount={nativeAmount} currencyCode={currencyCode} /> ={' '}
        </Boundary>
        <Boundary error={{ fallback: <span>—</span> }}>
          <FiatAmount nativeAmount={nativeAmount} fromCurrencyCode={currencyCode} fiatCurrencyCode={fiatCurrencyCode} />
        </Boundary>
      </span>
    </div>
  )
}
