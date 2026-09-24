import React from 'react'

import { useEdgeAccount } from '../auth'
import { Boundary, DisplayAmount, FiatAmount, FormControl, Logo } from '../components'
import { useCryptoInfo, useExchangeToNative, useRatePairs } from '../hooks'
import { normalize } from '../utils'

export const ExchangeRates = () => {
  const [searchQuery, setSearchQuery] = React.useState('')
  const account = useEdgeAccount()
  const query = normalize(searchQuery)
  const pairs = useRatePairs(account).filter(
    ({ currencyCode, fiatCurrencyCode }) =>
      normalize(currencyCode).includes(query) || normalize(fiatCurrencyCode).includes(query),
  )

  return (
    <div>
      <div className="panel-title">Exchange Rates</div>

      <FormControl
        placeholder={'Search'}
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.currentTarget.value)}
      />

      {pairs.map(({ currencyCode, fiatCurrencyCode }) => (
        <Boundary
          key={`${currencyCode}_${fiatCurrencyCode}`}
          error={{
            fallbackRender: function RateFallback() {
              return (
                <div className="rate-row">
                  <span>{currencyCode}</span>
                </div>
              )
            },
          }}
        >
          <ExchangeRate currencyCode={currencyCode} fiatCurrencyCode={fiatCurrencyCode} />
        </Boundary>
      ))}
    </div>
  )
}

const ExchangeRate: React.FC<{ currencyCode: string; fiatCurrencyCode: string }> = ({
  currencyCode,
  fiatCurrencyCode,
}) => {
  const account = useEdgeAccount()
  const info = useCryptoInfo(account, currencyCode)
  const nativeAmount = useExchangeToNative({ info, exchangeAmount: '1' })

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
