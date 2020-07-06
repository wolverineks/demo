import { EdgeCurrencyWallet, EdgeMetaToken } from 'edge-core-js'
import { useChangeWalletState, useOnNewTransactions, useWatchAll } from 'edge-react-hooks'
import * as React from 'react'
import { Button, Image, ListGroup } from 'react-bootstrap'

import { useAccount } from '../Auth'
import { Boundary } from '../Components/Boundary'
import { DisplayAmount } from '../Components/DisplayAmount'
import { Logo } from '../Components/Logo'
import { FiatAmount } from '../Fiat'
import { useEdgeCurrencyWallet, useEnabledTokens } from '../hooks'
import { useSelectedWallet } from '../SelectedWallet'
import { getBalance } from '../utils'

export const ActiveWalletList: React.FC<{
  onSelect: (wallet: EdgeCurrencyWallet) => any
}> = ({ onSelect }) => {
  const account = useAccount()
  const selectedWallet = useSelectedWallet()

  return (
    <ListGroup variant={'flush'}>
      {account.activeWalletIds.map((id) => (
        <Boundary key={id} suspense={{ fallback: <ListGroup.Item>Loading...</ListGroup.Item> }}>
          <ActiveWalletRow
            walletId={id}
            onSelect={onSelect}
            isSelected={!!selectedWallet && id === selectedWallet.id}
          />
        </Boundary>
      ))}
    </ListGroup>
  )
}

const ActiveWalletRow: React.FC<{
  walletId: string
  isSelected: boolean
  onSelect: (wallet: EdgeCurrencyWallet) => any
}> = ({ walletId, onSelect, isSelected }) => {
  const account = useAccount()
  const wallet = useEdgeCurrencyWallet({ account, walletId })
  useWatchAll(wallet)

  const balance = getBalance({ wallet, currencyCode: wallet.currencyInfo.currencyCode })

  useOnNewTransactions(wallet, (transactions) =>
    alert(`${wallet.name} - ${transactions.length > 1 ? 'New Transactions' : 'New Transaction'}`),
  )

  return (
    <ListGroup style={{ paddingTop: 4, paddingBottom: 4 }}>
      <ListGroup.Item variant={isSelected ? 'primary' : undefined}>
        <span onClick={() => onSelect(wallet)} className={'float-left'}>
          <Logo walletType={wallet.type} /> {wallet.name}{' '}
          <DisplayAmount nativeAmount={balance} currencyInfo={wallet.currencyInfo} /> -{' '}
          <FiatAmount
            currencyInfo={wallet.currencyInfo}
            toCurrencyCode={wallet.fiatCurrencyCode}
            nativeAmount={balance}
          />
        </span>

        <span className={'float-right'}>
          <WalletOptions wallet={wallet} />
        </span>
      </ListGroup.Item>

      <EnabledTokensList wallet={wallet} />
    </ListGroup>
  )
}

const WalletOptions = ({ wallet }: { wallet: EdgeCurrencyWallet }) => {
  const account = useAccount()
  const { execute: changeWalletState, status } = useChangeWalletState(account)
  const archiveWallet = () => changeWalletState({ walletId: wallet.id, walletState: { archived: true } })
  const deleteWallet = () => changeWalletState({ walletId: wallet.id, walletState: { deleted: true } })

  return (
    <>
      <Button variant={'danger'} disabled={status === 'loading'} onClick={deleteWallet}>
        Delete
      </Button>
      <Button variant={'warning'} disabled={status === 'loading'} onClick={archiveWallet}>
        Archive
      </Button>
    </>
  )
}

const useEnabledTokenInfos = ({ wallet }: { wallet: EdgeCurrencyWallet }) => {
  const enabledTokens = useEnabledTokens({ wallet })

  return wallet.currencyInfo.metaTokens.filter((tokenInfo) => enabledTokens.includes(tokenInfo.currencyCode))
}

export const EnabledTokensList: React.FC<{
  wallet: EdgeCurrencyWallet
}> = ({ wallet }) => {
  useWatchAll(wallet)

  const tokenInfos = useEnabledTokenInfos({ wallet })

  return tokenInfos.length > 0 ? (
    <ListGroup.Item>
      <ListGroup variant={'flush'}>
        {tokenInfos.map((tokenInfo) => (
          <EnabledTokenRow wallet={wallet} key={tokenInfo.currencyCode} tokenInfo={tokenInfo} />
        ))}
      </ListGroup>
    </ListGroup.Item>
  ) : null
}

const EnabledTokenRow: React.FC<{
  wallet: EdgeCurrencyWallet
  tokenInfo: EdgeMetaToken
}> = ({ wallet, tokenInfo }) => {
  useWatchAll(wallet)

  const { symbolImage } = tokenInfo
  const balance = wallet.balances[tokenInfo.currencyCode]

  return (
    <ListGroup.Item>
      <span className={'float-left'}>
        <Image src={symbolImage} />
        <DisplayAmount nativeAmount={balance} currencyInfo={tokenInfo} /> -{' '}
        <FiatAmount currencyInfo={tokenInfo} toCurrencyCode={wallet.fiatCurrencyCode} nativeAmount={balance} />
      </span>
    </ListGroup.Item>
  )
}
