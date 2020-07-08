import { EdgeCurrencyInfo, EdgeCurrencyWallet, EdgeMetaToken } from 'edge-core-js'
import * as React from 'react'
import { Card, Image, ListGroup } from 'react-bootstrap'

import { DisplayAmount } from '../components'
import { FiatAmount } from '../Fiat'
import { useSelectedWallet } from '../SelectedWallet'

export const BalanceList: React.FC = () => {
  const wallet = useSelectedWallet()
  const tokenInfos = wallet.currencyInfo.metaTokens

  return (
    <Card>
      <ListGroup>
        <ListGroup.Item>{wallet.name}</ListGroup.Item>
        <ListGroup.Item>
          <Balance
            wallet={wallet}
            currencyInfo={wallet.currencyInfo}
            nativeAmount={wallet.balances[wallet.currencyInfo.currencyCode]}
          />{' '}
        </ListGroup.Item>

        {tokenInfos.map((tokenInfo) =>
          wallet.balances[tokenInfo.currencyCode] ? (
            <ListGroup.Item key={tokenInfo.currencyCode}>
              <Balance
                wallet={wallet}
                currencyInfo={tokenInfo}
                nativeAmount={wallet.balances[tokenInfo.currencyCode]}
              />
            </ListGroup.Item>
          ) : null,
        )}
      </ListGroup>
    </Card>
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
    <FiatAmount currencyInfo={currencyInfo} toCurrencyCode={wallet.fiatCurrencyCode} nativeAmount={nativeAmount} />
  </div>
)
