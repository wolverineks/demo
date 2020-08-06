import { EdgeCurrencyWallet } from 'edge-core-js'
import React from 'react'
import { Card, ListGroup } from 'react-bootstrap'

import { Boundary, DisplayAmount, Logo } from '../components'
import { FiatAmount } from '../Fiat'
import { useBalance, useEnabledTokens, useFiatCurrencyCode, useName } from '../hooks'
import { useSelectedWallet } from '../SelectedWallet'

export const BalanceList: React.FC<{ wallet: EdgeCurrencyWallet }> = ({ wallet }) => (
  <Card>
    <ListGroup>
      <ListGroup.Item>{useName(wallet)}</ListGroup.Item>
      <ListGroup.Item>
        <Boundary>
          <Balance wallet={wallet} currencyCode={wallet.currencyInfo.currencyCode} />{' '}
        </Boundary>
      </ListGroup.Item>

      <ListGroup.Item>
        <TokenList />
      </ListGroup.Item>
    </ListGroup>
  </Card>
)

const TokenList = () => {
  const wallet = useSelectedWallet()
  const tokens = useEnabledTokens(wallet)

  return tokens.length <= 0 ? (
    <div>No Tokens</div>
  ) : (
    <div>
      {tokens.map((currencyCode) => (
        <Boundary key={currencyCode}>
          <Balance wallet={wallet} currencyCode={currencyCode} />
        </Boundary>
      ))}
    </div>
  )
}

const Balance: React.FC<{
  wallet: EdgeCurrencyWallet
  currencyCode: string
}> = ({ currencyCode, wallet }) => {
  const balance = useBalance(wallet, currencyCode)
  const [fiatCurrencyCode] = useFiatCurrencyCode(wallet)

  return (
    <div>
      <Logo currencyCode={currencyCode} />
      <DisplayAmount currencyCode={currencyCode} nativeAmount={balance} /> -{' '}
      <FiatAmount
        nativeAmount={balance}
        fromCurrencyCode={wallet.currencyInfo.currencyCode}
        fiatCurrencyCode={fiatCurrencyCode}
      />
    </div>
  )
}
