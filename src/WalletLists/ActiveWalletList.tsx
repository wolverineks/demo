import { EdgeCurrencyWallet } from 'edge-core-js'
import { useOnNewTransactions } from 'edge-react-hooks'
import React from 'react'
import { Button, ListGroup } from 'react-bootstrap'

import { useAccount } from '../auth'
import { Boundary, DisplayAmount, Logo } from '../components'
import { FiatAmount } from '../Fiat'
import { useActiveWalletIds, useBalance, useChangeWalletStates, useEnabledTokens, useName, useWallet } from '../hooks'
import { useSelectedWallet } from '../SelectedWallet'

export const ActiveWalletList: React.FC<{
  onSelect: (walletId: string) => any
}> = ({ onSelect }) => {
  const activeWalletIds = useActiveWalletIds(useAccount())

  return activeWalletIds.length <= 0 ? (
    <div>No active wallets</div>
  ) : (
    <ListGroup variant={'flush'}>
      {activeWalletIds.map((id) => (
        <Boundary key={id} suspense={{ fallback: <ListGroup.Item>Loading...</ListGroup.Item> }}>
          <ActiveWalletRow walletId={id} onSelect={() => onSelect(id)} />
        </Boundary>
      ))}
    </ListGroup>
  )
}

const ActiveWalletRow: React.FC<{
  walletId: string
  onSelect: () => any
}> = ({ walletId, onSelect }) => {
  const wallet = useWallet(useAccount(), walletId)
  const selectedWallet = useSelectedWallet()
  const currencyCode = wallet.currencyInfo.currencyCode
  const balance = useBalance(wallet, currencyCode)
  const name = useName(wallet)

  useOnNewTransactions(wallet, (transactions) =>
    alert(`${name} - ${transactions.length > 1 ? 'New Transactions' : 'New Transaction'}`),
  )

  return (
    <ListGroup style={{ paddingTop: 4, paddingBottom: 4 }}>
      <ListGroup.Item variant={wallet.id === selectedWallet.id ? 'primary' : undefined}>
        <span onClick={() => onSelect()} className={'float-left'}>
          <Logo currencyCode={currencyCode} /> {name}{' '}
          <DisplayAmount nativeAmount={balance} currencyCode={currencyCode} /> -{' '}
          <FiatAmount
            nativeAmount={balance}
            fromCurrencyCode={currencyCode}
            fiatCurrencyCode={wallet.fiatCurrencyCode}
          />
        </span>

        <WalletOptions walletId={wallet.id} />
      </ListGroup.Item>

      <EnabledTokensList wallet={wallet} />
    </ListGroup>
  )
}

const WalletOptions = ({ walletId }: { walletId: string }) => {
  const { archiveWallet, deleteWallet, status } = useChangeWalletStates(useAccount(), walletId)

  return (
    <span className={'float-right'}>
      <Button variant={'danger'} disabled={status === 'loading'} onClick={deleteWallet}>
        Delete
      </Button>
      <Button variant={'warning'} disabled={status === 'loading'} onClick={archiveWallet}>
        Archive
      </Button>
    </span>
  )
}

export const EnabledTokensList: React.FC<{ wallet: EdgeCurrencyWallet }> = ({ wallet }) => {
  const tokenCodes = useEnabledTokens(wallet)

  return tokenCodes.length > 0 ? (
    <ListGroup.Item>
      <ListGroup variant={'flush'}>
        {tokenCodes.map((currencyCode) => (
          <EnabledTokenRow wallet={wallet} key={currencyCode} currencyCode={currencyCode} />
        ))}
      </ListGroup>
    </ListGroup.Item>
  ) : null
}

const EnabledTokenRow: React.FC<{
  wallet: EdgeCurrencyWallet
  currencyCode: string
}> = ({ wallet, currencyCode }) => {
  const balance = useBalance(wallet, currencyCode)

  return (
    <ListGroup.Item>
      <span className={'float-left'}>
        <Logo currencyCode={currencyCode} />
        <DisplayAmount nativeAmount={balance} currencyCode={currencyCode} /> -{' '}
        <FiatAmount nativeAmount={balance} fromCurrencyCode={currencyCode} fiatCurrencyCode={wallet.fiatCurrencyCode} />
      </span>
    </ListGroup.Item>
  )
}
