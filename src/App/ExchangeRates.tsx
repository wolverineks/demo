import { EdgeAccount, EdgeTokenId } from 'edge-core-js'
import React from 'react'

import { useEdgeAccount } from '../auth'
import { Boundary, DisplayAmount, FiatAmount, FormControl, Logo } from '../components'
import { useCryptoInfo, useExchangeToNative, useRatePairs } from '../hooks'
import { normalize } from '../utils'

const currencyCodeForSearch = (account: EdgeAccount, pluginId: string, tokenId: EdgeTokenId) => {
  const config = account.currencyConfig[pluginId]
  if (!config) return ''
  if (tokenId == null) return config.currencyInfo.currencyCode

  return config.allTokens[tokenId]?.currencyCode ?? ''
}

export const ExchangeRates = () => {
  const [searchQuery, setSearchQuery] = React.useState('')
  const account = useEdgeAccount()
  const query = normalize(searchQuery)
  const pairs = useRatePairs(account).filter(({ pluginId, tokenId, fiatCurrencyCode }) => {
    const currencyCode = currencyCodeForSearch(account, pluginId, tokenId)

    return normalize(currencyCode).includes(query) || normalize(fiatCurrencyCode).includes(query)
  })

  return (
    <div>
      <div className="panel-title">Exchange Rates</div>

      <FormControl
        placeholder={'Search'}
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.currentTarget.value)}
      />

      {pairs.map(({ pluginId, tokenId, fiatCurrencyCode }) => (
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
  const account = useEdgeAccount()
  const info = useCryptoInfo(account, pluginId, tokenId)
  const nativeAmount = useExchangeToNative({ info, exchangeAmount: '1' })

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
