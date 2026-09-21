import { EdgeCurrencyWallet, EdgeTokenId } from 'edge-core-js'
import React from 'react'

import { useEdgeAccount } from '../auth'
import { Boundary, DisplayAmount, FiatAmount, FormControl, Logo } from '../components'
import { denominatedToNative, useActiveTokenIds, useDefaultFiatCurrencyCode, useTokenDisplayDenomination } from '../hooks'
import { normalize } from '../utils'

export const ExchangeRates = () => {
  const [searchQuery, setSearchQuery] = React.useState('')
  const account = useEdgeAccount()
  const tokenIds = useActiveTokenIds(account)
  const query = normalize(searchQuery)

  const visibleTokenIds = tokenIds.filter(({ currencyCode }) => normalize(currencyCode).includes(query))

  return (
    <div>
      <div className="panel-title">Exchange Rates</div>

      <FormControl
        placeholder={'Search'}
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.currentTarget.value)}
      />

      {visibleTokenIds.map(({ key, wallet, tokenId, currencyCode, pluginId }) => (
        <Boundary
          key={key}
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
          <ExchangeRate wallet={wallet} tokenId={tokenId} currencyCode={currencyCode} pluginId={pluginId} />
        </Boundary>
      ))}
    </div>
  )
}

const ExchangeRate: React.FC<{
  wallet: EdgeCurrencyWallet
  tokenId: EdgeTokenId
  currencyCode: string
  pluginId: string
}> = ({ wallet, tokenId, currencyCode, pluginId }) => {
  const account = useEdgeAccount()
  const [fiatCurrencyCode] = useDefaultFiatCurrencyCode(account)
  const [displayDenomination] = useTokenDisplayDenomination(account, wallet, tokenId)
  const nativeAmount = denominatedToNative({ denomination: displayDenomination, amount: '1' })

  return (
    <div className="rate-row">
      <Boundary error={{ fallback: null }} suspense={{ fallback: null }}>
        <Logo currencyCode={currencyCode} pluginId={pluginId} tokenId={tokenId ?? undefined} />
      </Boundary>
      <span>
        <Boundary error={{ fallback: <span>{currencyCode}</span> }}>
          <DisplayAmount nativeAmount={nativeAmount} wallet={wallet} tokenId={tokenId} /> ={' '}
        </Boundary>
        <Boundary error={{ fallback: <span>—</span> }}>
          <FiatAmount nativeAmount={nativeAmount} wallet={wallet} tokenId={tokenId} fiatCurrencyCode={fiatCurrencyCode} />
        </Boundary>
      </span>
    </div>
  )
}
