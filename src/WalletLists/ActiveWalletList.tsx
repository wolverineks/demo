import { EdgeCurrencyWallet, EdgeMetaToken } from 'edge-core-js'
import { useChangeWalletState, useOnNewTransactions } from 'edge-react-hooks'
import * as React from 'react'
import { Button, Image, ListGroup } from 'react-bootstrap'

import { useAccount } from '../auth'
import { Boundary, DisplayAmount, Logo } from '../components'
import { onRender } from '../EdgeAccount/AccountInfo'
import { FiatAmount } from '../Fiat'
import { useEnabledTokens, useWallet } from '../hooks'
import { useSelectedWallet } from '../SelectedWallet'
import { getBalance } from '../utils'

export const ActiveWalletList: React.FC<{
  onSelect: (walletId: string) => any
}> = ({ onSelect }) => {
  const account = useAccount()

  // return <div>No active wallets</div>
  return account.activeWalletIds.length <= 0 ? (
    <div>No active wallets</div>
  ) : (
    <ListGroup variant={'flush'}>
      {account.activeWalletIds.map((id) => (
        <React.Profiler key={id} id={id} onRender={onRender}>
          <Boundary key={id} suspense={{ fallback: <ListGroup.Item>Loading...</ListGroup.Item> }}>
            <ActiveWalletRow walletId={id} onSelect={() => onSelect(id)} />
          </Boundary>
        </React.Profiler>
      ))}
    </ListGroup>
  )
}

const ActiveWalletRow: React.FC<{
  walletId: string
  onSelect: () => any
}> = ({ walletId, onSelect }) => {
  const account = useAccount()
  const wallet = useWallet({ account, walletId })
  const selectedWallet = useSelectedWallet()
  const isSelected = wallet.id === selectedWallet.id

  const balance = getBalance({ wallet, currencyCode: wallet.currencyInfo.currencyCode })

  useOnNewTransactions(wallet, (transactions) =>
    alert(`${wallet.name} - ${transactions.length > 1 ? 'New Transactions' : 'New Transaction'}`),
  )

  return (
    <ListGroup style={{ paddingTop: 4, paddingBottom: 4 }}>
      <ListGroup.Item variant={isSelected ? 'primary' : undefined}>
        <span onClick={() => onSelect()} className={'float-left'}>
          <Logo walletType={wallet.type} /> {wallet.name}{' '}
          <DisplayAmount nativeAmount={balance} currencyInfo={wallet.currencyInfo} /> -{' '}
          <FiatAmount
            currencyInfo={wallet.currencyInfo}
            toCurrencyCode={wallet.fiatCurrencyCode}
            nativeAmount={balance}
          />
        </span>

        <span className={'float-right'}>
          <WalletOptions />
        </span>
      </ListGroup.Item>

      <EnabledTokensList wallet={wallet} />
    </ListGroup>
  )
}

const WalletOptions = () => {
  const account = useAccount()
  const wallet = useSelectedWallet()
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

export const EnabledTokensList: React.FC<{ wallet: EdgeCurrencyWallet }> = ({ wallet }) => {
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
