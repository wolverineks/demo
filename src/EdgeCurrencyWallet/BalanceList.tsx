import { EdgeCurrencyInfo, EdgeCurrencyWallet, EdgeMetaToken } from 'edge-core-js'
import React from 'react'
import { Card, Image, ListGroup } from 'react-bootstrap'

import { DisplayAmount } from '../components'
import { FiatAmount } from '../Fiat'
import { useBalance, useBalances, useEnabledTokenInfos, useFiatCurrencyCode, useName } from '../hooks'
import { useSelectedWallet } from '../SelectedWallet'

export const BalanceList: React.FC = () => {
  const wallet = useSelectedWallet()

  return (
    <Card>
      <ListGroup>
        <ListGroup.Item>{useName(wallet)}</ListGroup.Item>
        <ListGroup.Item>
          <Balance
            wallet={wallet}
            currencyInfo={wallet.currencyInfo}
            nativeAmount={useBalance(wallet, wallet.currencyInfo.currencyCode)}
          />{' '}
        </ListGroup.Item>

        <ListGroup.Item>
          <TokenList />
        </ListGroup.Item>
      </ListGroup>
    </Card>
  )
}

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
          currencyInfo={tokenInfo}
          nativeAmount={wallet.balances[tokenInfo.currencyCode]}
        />
      ))}
    </div>
  )
}

const Balance: React.FC<{
  wallet: EdgeCurrencyWallet
  currencyInfo: EdgeCurrencyInfo | EdgeMetaToken
  nativeAmount: string
}> = ({ currencyInfo, nativeAmount = '0', wallet }) => (
  <div>
    <Image src={currencyInfo.symbolImage} />
    <DisplayAmount currencyInfo={currencyInfo} nativeAmount={nativeAmount} /> -{' '}
    <FiatAmount currencyInfo={currencyInfo} toCurrencyCode={useFiatCurrencyCode(wallet)} nativeAmount={nativeAmount} />
  </div>
)
