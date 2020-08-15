import { EdgeCurrencyWallet } from 'edge-core-js'
import { useOnNewTransactions } from 'edge-react-hooks'
import React from 'react'
import { Accordion, Button, ListGroup } from 'react-bootstrap'

import { useAccount } from '../auth'
import { Boundary, DisplayAmount, Logo } from '../components'
import { FiatAmount } from '../Fiat'
import {
  useActiveWalletIds,
  useBalance,
  useChangeWalletStates,
  useEnabledTokens,
  useName,
  useSortedCurrencyWallets,
  useWallet,
} from '../hooks'
import { useSearchQuery } from '../search'
import { SelectedWalletBoundary, useSelectedWallet } from '../SelectedWallet'
import { useFilteredWalletIds } from './filter'

export const ActiveWalletList: React.FC<{ onSelect: () => void }> = ({ onSelect }) => {
  const account = useAccount()
  const searchQuery = useSearchQuery()
  const activeWalletIds = useActiveWalletIds(account)
  const currencyWallets = useSortedCurrencyWallets(account)
  const visibleWalletIds = useFilteredWalletIds(currencyWallets, activeWalletIds, searchQuery)

  return (
    <Accordion defaultActiveKey={'0'}>
      <Accordion.Toggle as={ListGroup.Item} eventKey={'0'}>
        Active Wallets ({visibleWalletIds.length})
      </Accordion.Toggle>

      <Accordion.Collapse eventKey={'0'}>
        <ListGroup variant={'flush'}>
          {visibleWalletIds.map((id) => (
            <Boundary key={id} suspense={{ fallback: <ListGroup.Item>Loading...</ListGroup.Item> }}>
              <SelectedWalletBoundary>
                <ActiveWalletRow walletId={id} onSelect={onSelect} />
              </SelectedWalletBoundary>
            </Boundary>
          ))}
        </ListGroup>
      </Accordion.Collapse>
    </Accordion>
  )
}

const ActiveWalletRow: React.FC<{ walletId: string; onSelect: () => void }> = ({ walletId, onSelect }) => {
  const account = useAccount()
  const wallet = useWallet({ account, walletId })
  const currencyCode = wallet.currencyInfo.currencyCode
  const balance = useBalance(wallet, currencyCode)
  const name = useName(wallet)

  const [selected, select] = useSelectedWallet()

  useOnNewTransactions(wallet, (transactions) =>
    alert(`${name} - ${transactions.length > 1 ? 'New Transactions' : 'New Transaction'}`),
  )

  return (
    <>
      <ListGroup.Item
        variant={wallet.id === selected.id && currencyCode === selected?.currencyCode ? 'primary' : undefined}
      >
        <span
          onClick={() => {
            select({ id: walletId, currencyCode })
            onSelect()
          }}
          className={'float-left'}
        >
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

      <EnabledTokensList wallet={wallet} onSelect={onSelect} />
    </>
  )
}

const WalletOptions = ({ walletId }: { walletId: string }) => {
  const { archiveWallet, deleteWallet, status } = useChangeWalletStates(useAccount())

  return (
    <span className={'float-right'}>
      <Button variant={'warning'} disabled={status === 'loading'} onClick={() => archiveWallet(walletId)}>
        A
      </Button>
      <Button variant={'danger'} disabled={status === 'loading'} onClick={() => deleteWallet(walletId)}>
        X
      </Button>
    </span>
  )
}

export const EnabledTokensList: React.FC<{ wallet: EdgeCurrencyWallet; onSelect: () => void }> = ({
  wallet,
  onSelect,
}) => {
  const tokenCodes = useEnabledTokens(wallet)

  return tokenCodes.length > 0 ? (
    <ListGroup.Item>
      <ListGroup variant={'flush'}>
        {tokenCodes.map((currencyCode) => (
          <Boundary key={currencyCode}>
            <EnabledTokenRow wallet={wallet} currencyCode={currencyCode} onSelect={onSelect} />
          </Boundary>
        ))}
      </ListGroup>
    </ListGroup.Item>
  ) : null
}

const EnabledTokenRow: React.FC<{ wallet: EdgeCurrencyWallet; currencyCode: string; onSelect: () => void }> = ({
  wallet,
  currencyCode,
  onSelect,
}) => {
  const [selected, select] = useSelectedWallet()

  return (
    <ListGroup.Item
      variant={wallet.id === selected.id && currencyCode === selected?.currencyCode ? 'primary' : undefined}
      onClick={() => {
        onSelect()
        select({ id: wallet.id, currencyCode })
      }}
    >
      <span className={'float-left'}>
        <Logo currencyCode={currencyCode} />
        <Boundary suspense={{ fallback: <span>Loading...</span> }}>
          <Amounts wallet={wallet} currencyCode={currencyCode} />
        </Boundary>
      </span>
    </ListGroup.Item>
  )
}

const Amounts: React.FC<{ wallet: EdgeCurrencyWallet; currencyCode: string }> = ({ wallet, currencyCode }) => {
  const balance = useBalance(wallet, currencyCode) || '0'

  return (
    <>
      <DisplayAmount nativeAmount={balance} currencyCode={currencyCode} /> -{' '}
      <FiatAmount nativeAmount={balance} fromCurrencyCode={currencyCode} fiatCurrencyCode={wallet.fiatCurrencyCode} />
    </>
  )
}
