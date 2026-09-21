import { EdgeAccount, EdgeCurrencyWallet } from 'edge-core-js'
import React from 'react'

import { useEdgeAccount } from '../auth'
import { Boundary, DisplayAmount, FiatAmount, FormControl, Logo } from '../components'
import { useExchangeToNative, useWatch } from '../hooks'
import { getCurrencyCodeFromTokenId, getWalletTokenIds, normalize, uniqueBy } from '../utils'

const getRatePairs = (account: EdgeAccount) =>
  uniqueBy(
    ({ currencyCode, fiatCurrencyCode }) => `${currencyCode}_${fiatCurrencyCode}`,
    Object.values(account.currencyWallets).flatMap((wallet) =>
      getWalletTokenIds(wallet).map((tokenId) => ({
        currencyCode: getCurrencyCodeFromTokenId(wallet, tokenId),
        fiatCurrencyCode: wallet.fiatCurrencyCode,
      })),
    ),
  )

export const ExchangeRates = () => {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [, setVersion] = React.useState(0)
  const account = useEdgeAccount()
  useWatch(account, 'currencyWallets')
  const bump = React.useCallback(() => setVersion((version) => version + 1), [])
  const query = normalize(searchQuery)
  const pairs = getRatePairs(account).filter(
    ({ currencyCode, fiatCurrencyCode }) =>
      normalize(currencyCode).includes(query) || normalize(fiatCurrencyCode).includes(query),
  )

  return (
    <div>
      <div className="panel-title">Exchange Rates</div>

      {Object.values(account.currencyWallets).map((wallet) => (
        <WalletPairSource key={wallet.id} wallet={wallet} onChange={bump} />
      ))}

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

const WalletPairSource: React.FC<{ wallet: EdgeCurrencyWallet; onChange: () => void }> = ({ wallet, onChange }) => {
  useWatch(wallet, 'enabledTokenIds', onChange)
  useWatch(wallet, 'fiatCurrencyCode', onChange)

  return null
}

const ExchangeRate: React.FC<{ currencyCode: string; fiatCurrencyCode: string }> = ({
  currencyCode,
  fiatCurrencyCode,
}) => {
  const account = useEdgeAccount()
  const nativeAmount = useExchangeToNative({ account, currencyCode, exchangeAmount: '1' })

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
