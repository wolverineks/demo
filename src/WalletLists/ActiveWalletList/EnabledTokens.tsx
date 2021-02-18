import { EdgeCurrencyWallet } from 'edge-core-js'
import React from 'react'
import { ListGroup } from 'react-bootstrap'

import { Balance, Boundary, Logo } from '../../components'
import { useTokens } from '../../hooks'
import { useSelectedWalletInfo } from '../../SelectedWallet'

export const EnabledTokens: React.FC<{ wallet: EdgeCurrencyWallet; onSelect: () => void }> = ({ wallet, onSelect }) => {
  const tokens = useTokens(wallet)

  return tokens.enabled.length > 0 ? (
    <ListGroup.Item>
      <ListGroup variant={'flush'}>
        {tokens.enabled.map((currencyCode) => (
          <Boundary key={currencyCode} error={{ fallbackRender: () => null }}>
            <EnabledToken wallet={wallet} currencyCode={currencyCode} onSelect={onSelect} />
          </Boundary>
        ))}
      </ListGroup>
    </ListGroup.Item>
  ) : null
}

const EnabledToken: React.FC<{ wallet: EdgeCurrencyWallet; currencyCode: string; onSelect: () => void }> = ({
  wallet,
  currencyCode,
  onSelect,
}) => {
  const [selected, select] = useSelectedWalletInfo()

  return (
    <ListGroup.Item
      variant={wallet.id === selected?.id && currencyCode === selected?.currencyCode ? 'primary' : undefined}
      onClick={() => {
        onSelect()
        select({ id: wallet.id, currencyCode })
      }}
    >
      <span className={'float-left'}>
        <Logo currencyCode={currencyCode} />
        <Boundary suspense={{ fallback: <span>Loading...</span> }}>
          <Balance wallet={wallet} currencyCode={currencyCode} />
        </Boundary>
      </span>
    </ListGroup.Item>
  )
}
