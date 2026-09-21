import { EdgeCurrencyWallet, EdgeTokenId } from 'edge-core-js'
import React from 'react'

import { useEdgeAccount } from '../auth'
import { Boundary, DisplayAmount, FiatAmount, FormControl, Logo } from '../components'
import {
  denominatedToNative,
  useActiveWalletTokenIds,
  useDefaultFiatCurrencyCode,
  useTokenDisplayDenomination,
} from '../hooks'
import { getCurrencyCodeFromTokenId, normalize } from '../utils'

export const ExchangeRates = () => {
  const [searchQuery, setSearchQuery] = React.useState('')
  const account = useEdgeAccount()
  const walletTokenIds = useActiveWalletTokenIds(account)
  const query = normalize(searchQuery)

  const visible = walletTokenIds.filter(({ wallet, tokenId }) =>
    normalize(getCurrencyCodeFromTokenId(wallet, tokenId)).includes(query),
  )

  return (
    <div>
      <div className="panel-title">Exchange Rates</div>

      <FormControl
        placeholder={'Search'}
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.currentTarget.value)}
      />

      {visible.map(({ wallet, tokenId }) => {
        const currencyCode = getCurrencyCodeFromTokenId(wallet, tokenId)

        return (
          <Boundary
            key={`${wallet.currencyInfo.pluginId}:${tokenId ?? 'native'}`}
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
            <ExchangeRate wallet={wallet} tokenId={tokenId} />
          </Boundary>
        )
      })}
    </div>
  )
}

const ExchangeRate: React.FC<{ wallet: EdgeCurrencyWallet; tokenId: EdgeTokenId }> = ({ wallet, tokenId }) => {
  const account = useEdgeAccount()
  const currencyCode = getCurrencyCodeFromTokenId(wallet, tokenId)
  const [fiatCurrencyCode] = useDefaultFiatCurrencyCode(account)
  const [displayDenomination] = useTokenDisplayDenomination(account, wallet, tokenId)
  const nativeAmount = denominatedToNative({ denomination: displayDenomination, amount: '1' })

  return (
    <div className="rate-row">
      <Boundary error={{ fallback: null }} suspense={{ fallback: null }}>
        <Logo currencyCode={currencyCode} pluginId={wallet.currencyInfo.pluginId} tokenId={tokenId ?? undefined} />
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
