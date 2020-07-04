import { EdgeAccount, EdgeCurrencyInfo, EdgeCurrencyWallet, EdgeMetaToken } from 'edge-core-js'
import { useEnabledTokens, useWatchAll } from 'edge-react-hooks'
import * as React from 'react'
import { Card, Image, ListGroup } from 'react-bootstrap'

import { DisplayAmount } from '../Components/DisplayAmount'
import { FiatAmount } from '../Fiat'

export const BalanceList: React.FC<{
  wallet: EdgeCurrencyWallet
  account: EdgeAccount
}> = ({ wallet, account }) => {
  useWatchAll(wallet)
  useWatchAll(account)

  const enabledTokens = useEnabledTokens(wallet)

  if (enabledTokens.error) return <div>Error: {enabledTokens.error.message}</div>
  if (!enabledTokens.data) return <div>Loading...</div>

  const tokenInfos = wallet.currencyInfo.metaTokens

  return (
    <Card>
      <ListGroup>
        <ListGroup.Item>{wallet.name}</ListGroup.Item>
        <ListGroup.Item>
          <Balance
            account={account}
            wallet={wallet}
            currencyInfo={wallet.currencyInfo}
            nativeAmount={wallet.balances[wallet.currencyInfo.currencyCode]}
          />{' '}
        </ListGroup.Item>

        {tokenInfos.map((tokenInfo) =>
          wallet.balances[tokenInfo.currencyCode] ? (
            <ListGroup.Item key={tokenInfo.currencyCode}>
              <Balance
                account={account}
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
  account: EdgeAccount
  wallet: EdgeCurrencyWallet
  currencyInfo: EdgeCurrencyInfo | EdgeMetaToken
  nativeAmount: string
}> = ({ currencyInfo, nativeAmount = '0', account, wallet }) => {
  return (
    <div>
      <Image src={currencyInfo.symbolImage} />
      <DisplayAmount account={account} currencyInfo={currencyInfo} nativeAmount={nativeAmount} /> -{' '}
      <FiatAmount
        account={account}
        currencyInfo={currencyInfo}
        toCurrencyCode={wallet.fiatCurrencyCode}
        nativeAmount={nativeAmount}
      />
    </div>
  )
}
