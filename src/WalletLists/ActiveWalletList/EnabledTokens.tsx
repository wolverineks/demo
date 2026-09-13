import { EdgeCurrencyWallet } from 'edge-core-js'
import React from 'react'

import { useSelectWallet } from '../../App'
import { Balance, Boundary, ListGroup, Logo } from '../../components'
import { useTokens } from '../../hooks'

export const EnabledTokens: React.FC<{
  wallet: EdgeCurrencyWallet
}> = ({ wallet }) => {
  const tokens = useTokens(wallet)

  return tokens.enabled.length > 0 ? (
    <ListGroup.Item>
      <ListGroup variant={'flush'}>
        {tokens.enabled.map((currencyCode) => (
          <Boundary key={currencyCode} error={{ fallbackRender: () => null }}>
            <EnabledToken wallet={wallet} currencyCode={currencyCode} />
          </Boundary>
        ))}
      </ListGroup>
    </ListGroup.Item>
  ) : null
}

const EnabledToken: React.FC<{ wallet: EdgeCurrencyWallet; currencyCode: string }> = ({ wallet, currencyCode }) => {
  const [selected, select] = useSelectWallet()

  return (
    <ListGroup.Item
      className="wallet-row"
      variant={wallet.id === selected?.id && currencyCode === selected?.currencyCode ? 'primary' : undefined}
      onClick={() => select({ id: wallet.id, currencyCode })}
    >
      <div className="wallet-row__main">
        <Logo currencyCode={currencyCode} />
        <div className="wallet-row__balance">
          <Boundary suspense={{ fallback: <span>Loading...</span> }}>
            <Balance wallet={wallet} currencyCode={currencyCode} />
          </Boundary>
        </div>
      </div>
    </ListGroup.Item>
  )
}
