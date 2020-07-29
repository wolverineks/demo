import { EdgeCurrencyWallet } from 'edge-core-js'
import React from 'react'
import { Card, ListGroup } from 'react-bootstrap'

import { DisplayAmount, Logo } from '../components'
import { FiatAmount } from '../Fiat'
import { useBalance, useBalances, useEnabledTokenInfos, useFiatCurrencyCode, useName } from '../hooks'
import { useSelectedWallet } from '../SelectedWallet'

export const BalanceList: React.FC<{ wallet: EdgeCurrencyWallet }> = ({ wallet }) => (
  <Card>
    <ListGroup>
      <ListGroup.Item>{useName(wallet)}</ListGroup.Item>
      <ListGroup.Item>
        <Balance
          wallet={wallet}
          currencyCode={wallet.currencyInfo.currencyCode}
          nativeAmount={useBalance(wallet, wallet.currencyInfo.currencyCode)}
        />{' '}
      </ListGroup.Item>

      <ListGroup.Item>
        <TokenList />
      </ListGroup.Item>
    </ListGroup>
  </Card>
)

const TokenList = () => {
  const wallet = useSelectedWallet()
  useBalances(wallet)
  const tokenInfos = useEnabledTokenInfos(wallet)

  return tokenInfos.length <= 0 ? (
    <div>No Tokens</div>
  ) : (
    <div>
      {tokenInfos.map((tokenInfo) => (
        <Balance
          key={tokenInfo.currencyCode}
          wallet={wallet}
          currencyCode={tokenInfo.currencyCode}
          nativeAmount={wallet.balances[tokenInfo.currencyCode]}
        />
      ))}
    </div>
  )
}

const Balance: React.FC<{
  wallet: EdgeCurrencyWallet
  currencyCode: string
  nativeAmount: string
}> = ({ currencyCode, nativeAmount = '0', wallet }) => {
  const [fiatCurrencyCode] = useFiatCurrencyCode(wallet)

  return (
    <div>
      <Logo currencyCode={currencyCode} />
      <DisplayAmount currencyCode={currencyCode} nativeAmount={nativeAmount} /> -{' '}
      <FiatAmount
        nativeAmount={nativeAmount}
        fromCurrencyCode={wallet.currencyInfo.currencyCode}
        fiatCurrencyCode={fiatCurrencyCode}
      />
    </div>
  )
}
