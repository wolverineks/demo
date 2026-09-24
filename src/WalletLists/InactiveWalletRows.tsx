import { EdgeAccount, EdgeTokenId } from 'edge-core-js'
import React from 'react'

import { useEdgeAccount } from '../auth'
import { Boundary, DisplayAmount, FiatAmount, ListGroup, Logo } from '../components'
import { InactiveWallet, useCryptoInfo } from '../hooks'
import { normalize } from '../utils'

const currencyCodeForToken = (account: EdgeAccount, pluginId: string, tokenId: EdgeTokenId) => {
  const config = account.currencyConfig[pluginId]
  if (!config) return ''
  if (tokenId == null) return config.currencyInfo.currencyCode

  return config.allTokens[tokenId]?.currencyCode ?? ''
}

export const inactiveWalletMatches = (account: EdgeAccount, snapshot: InactiveWallet, searchQuery: string) => {
  const query = normalize(searchQuery)
  const targets = [
    snapshot.name || '',
    snapshot.fiatCurrencyCode,
    ...snapshot.tokenBalances.map(({ tokenId }) => currencyCodeForToken(account, snapshot.pluginId, tokenId)),
  ]

  return targets.some((target) => normalize(target).includes(query))
}

export const InactiveWalletRows: React.FC<{
  snapshot: InactiveWallet
  actions?: React.ReactNode
}> = ({ snapshot, actions }) => {
  const [parent, ...tokens] = snapshot.tokenBalances

  return (
    <>
      {parent && (
        <ListGroup.Item className="wallet-row">
          <div className="wallet-row__body">
            <div className="wallet-row__main">
              <Logo pluginId={snapshot.pluginId} tokenId={parent.tokenId} />
              <div className="wallet-row__text">
                <div className="wallet-row__name">{snapshot.name}</div>
                <div className="wallet-row__balance">
                  <TokenAmount snapshot={snapshot} tokenId={parent.tokenId} nativeAmount={parent.nativeAmount} />
                </div>
              </div>
            </div>
            {actions && <span className="wallet-actions">{actions}</span>}
          </div>
        </ListGroup.Item>
      )}
      {tokens.map(({ tokenId, nativeAmount }) => (
        <ListGroup.Item key={tokenId} className="token-row">
          <Logo pluginId={snapshot.pluginId} tokenId={tokenId} />
          <div className="token-row__text">
            <TokenName pluginId={snapshot.pluginId} tokenId={tokenId} />
            <div className="token-row__balance">
              <TokenAmount snapshot={snapshot} tokenId={tokenId} nativeAmount={nativeAmount} />
            </div>
          </div>
        </ListGroup.Item>
      ))}
    </>
  )
}

const TokenName = ({ pluginId, tokenId }: { pluginId: string; tokenId: EdgeTokenId }) => {
  const info = useCryptoInfo(useEdgeAccount(), pluginId, tokenId)

  return <div className="token-row__name">{info.currencyCode}</div>
}

const TokenAmount = ({
  snapshot,
  tokenId,
  nativeAmount,
}: {
  snapshot: InactiveWallet
  tokenId: EdgeTokenId
  nativeAmount: string
}) => (
  <Boundary>
    <DisplayAmount nativeAmount={nativeAmount} pluginId={snapshot.pluginId} tokenId={tokenId} /> -{' '}
    <FiatAmount
      nativeAmount={nativeAmount}
      pluginId={snapshot.pluginId}
      tokenId={tokenId}
      fiatCurrencyCode={snapshot.fiatCurrencyCode}
    />
  </Boundary>
)
