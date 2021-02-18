import React from 'react'
import { FormControl } from 'react-bootstrap'

import { useEdgeAccount } from '../auth'
import { Boundary, DisplayAmount, FiatAmount, Logo } from '../components'
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
      <div>Exchange Rates</div>

      <FormControl
        placeholder={'Search'}
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.currentTarget.value)}
      />

      {visibleCurrencyCodes.map((currencyCode) => (
        <Boundary
          key={currencyCode}
          error={{
            fallbackRender: () =>
              null /* HACK: wallets.getEnabledTokens includes tokens that arent enabled and dont have a token info */,
          }}
        >
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
      <Logo currencyCode={currencyCode} />{' '}
      <Boundary error={{ fallback: null }}>
        <DisplayAmount nativeAmount={nativeAmount} currencyCode={currencyCode} /> ={' '}
      </Boundary>
      <Boundary error={{ fallback: null }}>
        <FiatAmount nativeAmount={nativeAmount} fromCurrencyCode={currencyCode} fiatCurrencyCode={fiatCurrencyCode} />
      </Boundary>
    </div>
  )
}
