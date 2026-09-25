import { EdgeTokenId } from 'edge-core-js'
import React from 'react'

import { useEdgeAccount } from '../auth'
import { Boundary, DisplayAmount, FiatAmount, FormControl, Logo } from '../components'
import { exchangeToNative, useCryptoInfo, useExchangeInfos } from '../hooks'
import { normalize } from '../utils'

export const ExchangeRates = () => {
  const [searchQuery, setSearchQuery] = React.useState('')
  const account = useEdgeAccount()
  const query = normalize(searchQuery)
  const exchangeInfos = useExchangeInfos(account).filter(
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

      {exchangeInfos.map(({ pluginId, tokenId, fiatCurrencyCode }) => (
        <Boundary
          key={`${pluginId}:${tokenId ?? 'native'}_${fiatCurrencyCode}`}
          error={{
            fallbackRender: function RateFallback() {
              return (
                <div className="rate-row">
                  <span>
                    {pluginId}
                    {tokenId == null ? '' : `:${tokenId}`}
                  </span>
                </div>
              )
            },
          }}
        >
          <ExchangeRate pluginId={pluginId} tokenId={tokenId} fiatCurrencyCode={fiatCurrencyCode} />
        </Boundary>
      ))}
    </div>
  )
}

const ExchangeRate: React.FC<{ pluginId: string; tokenId: EdgeTokenId; fiatCurrencyCode: string }> = ({
  pluginId,
  tokenId,
  fiatCurrencyCode,
}) => {
  const info = useCryptoInfo(pluginId, tokenId)
  const nativeAmount = exchangeToNative({ info, exchangeAmount: '1' })

  return (
    <div className="rate-row">
      <Boundary error={{ fallback: null }} suspense={{ fallback: null }}>
        <Logo pluginId={pluginId} tokenId={tokenId} />
      </Boundary>
      <span>
        <Boundary error={{ fallback: <span>{info.currencyCode}</span> }}>
          <DisplayAmount nativeAmount={nativeAmount} pluginId={pluginId} tokenId={tokenId} /> ={' '}
        </Boundary>
        <Boundary error={{ fallback: <span>—</span> }}>
          <FiatAmount
            nativeAmount={nativeAmount}
            pluginId={pluginId}
            tokenId={tokenId}
            fiatCurrencyCode={fiatCurrencyCode}
          />
        </Boundary>
      </span>
    </div>
  )
}
