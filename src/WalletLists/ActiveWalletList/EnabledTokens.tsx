import { EdgeCurrencyWallet, EdgeMetaToken } from 'edge-core-js'
import React from 'react'

import { useSelectWallet } from '../../App'
import { Balance, Boundary, ListGroup, Logo } from '../../components'
import { useTokens } from '../../hooks'

export const EnabledTokens: React.FC<{
  wallet: EdgeCurrencyWallet
}> = ({ wallet }) => {
  const tokens = useTokens(wallet)

  if (tokens.enabled.length === 0) return null

  return (
    <>
      {tokens.enabled.map((currencyCode) => (
        <EnabledToken
          key={currencyCode}
          wallet={wallet}
          currencyCode={currencyCode}
          tokenInfo={tokens.includedInfos[currencyCode] || tokens.customTokenInfos[currencyCode]}
        />
      ))}
    </>
  )
}

const EnabledToken: React.FC<{
  wallet: EdgeCurrencyWallet
  currencyCode: string
  tokenInfo?: EdgeMetaToken
}> = ({ wallet, currencyCode, tokenInfo }) => {
  const [selected, select] = useSelectWallet()
  const extra = tokenInfo as (EdgeMetaToken & { pluginId?: string; tokenId?: string }) | undefined

  return (
    <ListGroup.Item
      className="token-row"
      variant={wallet.id === selected?.id && currencyCode === selected?.currencyCode ? 'primary' : undefined}
      onClick={() => select({ id: wallet.id, currencyCode })}
    >
      <Boundary error={{ fallback: null }} suspense={{ fallback: null }}>
        <Logo
          currencyCode={currencyCode}
          pluginId={extra?.pluginId || wallet.currencyInfo.pluginId}
          tokenId={extra?.tokenId}
          contractAddress={extra?.contractAddress}
        />
      </Boundary>
      <div className="token-row__text">
        <div className="token-row__name">{currencyCode}</div>
        <div className="token-row__balance">
          <Boundary suspense={{ fallback: <span>Loading...</span> }}>
            <Balance wallet={wallet} currencyCode={currencyCode} />
          </Boundary>
        </div>
      </div>
    </ListGroup.Item>
  )
}
