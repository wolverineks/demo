import { EdgeCurrencyWallet } from 'edge-core-js'
import React from 'react'

import { useSelectWallet } from '../../App'
import { Balance, Boundary, ListGroup, Logo } from '../../components'
import { TokenInfo, useTokens } from '../../hooks'
import { getCurrencyCodeFromTokenId } from '../../utils'

export const EnabledTokens: React.FC<{
  wallet: EdgeCurrencyWallet
}> = ({ wallet }) => {
  const tokens = useTokens(wallet)

  if (tokens.enabled.length === 0) return null

  return (
    <>
      {tokens.enabled.map((tokenId) => (
        <EnabledToken
          key={tokenId}
          wallet={wallet}
          tokenId={tokenId}
          tokenInfo={tokens.includedInfos[tokenId] || tokens.customTokenInfos[tokenId]}
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
  const currencyCode = tokenInfo?.currencyCode ?? getCurrencyCodeFromTokenId(wallet, tokenId)

  return (
    <ListGroup.Item
      className="token-row"
      variant={wallet.id === selected?.id && selected?.tokenId === tokenId ? 'primary' : undefined}
      onClick={() => select({ id: wallet.id, tokenId })}
    >
      <Boundary error={{ fallback: null }} suspense={{ fallback: null }}>
        <Logo
          currencyCode={currencyCode}
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
