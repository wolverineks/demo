import { EdgeCurrencyWallet } from 'edge-core-js'
import React from 'react'

import { useSelectWallet } from '../../App'
import { Balance, Boundary, ListGroup, Logo } from '../../components'
import { TokenInfo, useCurrencyCodeFromTokenId, useTokens } from '../../hooks'

export const EnabledTokens: React.FC<{
  wallet: EdgeCurrencyWallet
}> = ({ wallet }) => {
  const tokens = useTokens(wallet)

  if (tokens.enabledTokenIds.length === 0) return null

  return (
    <>
      {tokens.enabledTokenIds.map((tokenId) => (
        <EnabledToken
          key={tokenId}
          wallet={wallet}
          tokenId={tokenId}
          tokenInfo={tokens.includedTokenInfos[tokenId] || tokens.customTokenInfos[tokenId]}
        />
      ))}
    </>
  )
}

const EnabledToken: React.FC<{
  wallet: EdgeCurrencyWallet
  tokenId: string
  tokenInfo?: TokenInfo
}> = ({ wallet, tokenId, tokenInfo }) => {
  const [selected, select] = useSelectWallet()
  const resolvedCode = useCurrencyCodeFromTokenId(wallet.currencyInfo.pluginId, tokenId)
  const currencyCode = tokenInfo?.currencyCode ?? resolvedCode

  return (
    <ListGroup.Item
      className="token-row"
      variant={wallet.id === selected?.id && selected?.tokenId === tokenId ? 'primary' : undefined}
      onClick={() => select({ id: wallet.id, tokenId })}
    >
      <Boundary error={{ fallback: null }} suspense={{ fallback: null }}>
        <Logo
          pluginId={tokenInfo?.pluginId || wallet.currencyInfo.pluginId}
          tokenId={tokenId}
          contractAddress={tokenInfo?.contractAddress}
        />
      </Boundary>
      <div className="token-row__text">
        <div className="token-row__name">{currencyCode}</div>
        <div className="token-row__balance">
          <Boundary suspense={{ fallback: <span>Loading...</span> }}>
            <Balance wallet={wallet} tokenId={tokenId} />
          </Boundary>
        </div>
      </div>
    </ListGroup.Item>
  )
}
