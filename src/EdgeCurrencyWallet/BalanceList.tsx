import { EdgeCurrencyWallet } from 'edge-core-js'
import React from 'react'
import { Card, ListGroup } from 'react-bootstrap'

import { DisplayAmount, Logo } from '../components'
import { FiatAmount } from '../Fiat'
import { useBalance, useEnabledTokenInfos, useFiatCurrencyCode, useName } from '../hooks'
import { useSelectedWallet } from '../SelectedWallet'

export const BalanceList: React.FC<{ wallet: EdgeCurrencyWallet }> = ({ wallet }) => (
  <Card>
    <ListGroup>
      <ListGroup.Item>{useName(wallet)}</ListGroup.Item>
      <ListGroup.Item>
        <Balance wallet={wallet} currencyCode={wallet.currencyInfo.currencyCode} />{' '}
      </ListGroup.Item>

      <ListGroup.Item>
        <TokenList />
      </ListGroup.Item>
    </ListGroup>
  </Card>
)

const TokenList = () => {
  const wallet = useSelectedWallet()
  const tokenInfos = useEnabledTokenInfos(wallet)

  return tokenInfos.length <= 0 ? (
    <div>No Tokens</div>
  ) : (
    <div>
      {tokenInfos.map((tokenInfo) => (
        <Balance key={tokenInfo.currencyCode} wallet={wallet} currencyCode={tokenInfo.currencyCode} />
      ))}
    </div>
  )
}

const Balance: React.FC<{
  wallet: EdgeCurrencyWallet
  currencyCode: string
}> = ({ currencyCode, wallet }) => {
  const balance = useBalance(wallet, currencyCode) || '0'
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
