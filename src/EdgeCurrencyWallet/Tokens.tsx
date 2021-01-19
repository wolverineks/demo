import { EdgeCurrencyWallet, EdgeMetaToken } from 'edge-core-js'
import React from 'react'
import { Card, FormControl, ListGroup } from 'react-bootstrap'

import { useEdgeAccount } from '../auth'
import { Logo } from '../components'
import { useTokens } from '../hooks'
import { useFilter } from './useFilter'

export const Tokens: React.FC<{ wallet: EdgeCurrencyWallet }> = ({ wallet }) => {
  const account = useEdgeAccount()
  const { enabledTokens, enableToken, disableToken, availableTokenInfos } = useTokens(account, wallet)
  const toggleToken = React.useCallback(
    (currencyCode: string) =>
      enabledTokens.includes(currencyCode) ? disableToken(currencyCode) : enableToken(currencyCode),
    [disableToken, enableToken, enabledTokens],
  )
  const matches = (query: string) => (token: EdgeMetaToken): boolean => {
    const normalize = (text: string) => text.trim().toLowerCase()

    return (
      normalize(token.currencyCode).includes(normalize(query)) ||
      normalize(token.currencyName).includes(normalize(query)) ||
      normalize(token.contractAddress || '').includes(normalize(query))
    )
  }
  const [visibleTokens, setSearchQuery] = useFilter(matches, availableTokenInfos)

  return (
    <Card>
      <Card.Header>
        <Card.Title>Tokens</Card.Title>
      </Card.Header>
      <ListGroup>
        <FormControl placeholder={'Search'} onChange={(event) => setSearchQuery(event.currentTarget.value)} />
        {visibleTokens.length <= 0 ? (
          <ListGroup.Item>No Tokens Available</ListGroup.Item>
        ) : (
          [...visibleTokens]
            .sort()
            .map((tokenInfo) => (
              <TokenRow
                key={tokenInfo.currencyCode}
                tokenInfo={tokenInfo}
                isEnabled={enabledTokens.includes(tokenInfo.currencyCode)}
                onClick={toggleToken}
              />
            ))
        )}
      </ListGroup>
    </Card>
  )
}

const TokenRow: React.FC<{
  tokenInfo: EdgeMetaToken
  isEnabled: boolean
  onClick: (currencyCode: string) => void
}> = ({ tokenInfo, isEnabled, onClick }) => {
  const { currencyName } = tokenInfo

  return (
    <ListGroup.Item
      key={tokenInfo.currencyCode}
      variant={isEnabled ? 'primary' : undefined}
      onClick={() => onClick(tokenInfo.currencyCode)}
    >
      <Logo currencyCode={tokenInfo.currencyCode} /> {tokenInfo.currencyCode} - {currencyName}
    </ListGroup.Item>
  )
}
