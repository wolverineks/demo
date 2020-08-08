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
import { useSelectedWallet } from '../SelectedWallet'
import { useFilteredWalletIds } from './filter'

export const ActiveWalletList: React.FC<{
  onSelect: (walletId: string) => any
}> = ({ onSelect }) => {
  const account = useAccount()
  const selectedWallet = useSelectedWallet()
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
              <ActiveWalletRow walletId={id} onSelect={() => onSelect(id)} isSelected={id === selectedWallet.id} />
            </Boundary>
          ))}
        </ListGroup>
      </Accordion.Collapse>
    </Accordion>
  )
}

const ActiveWalletRow: React.FC<{
  walletId: string
  onSelect: () => any
  isSelected: boolean
}> = ({ walletId, onSelect, isSelected }) => {
  const wallet = useWallet(useAccount(), walletId)
  const currencyCode = wallet.currencyInfo.currencyCode
  const balance = useBalance(wallet, currencyCode) || '0'
  const name = useName(wallet)

  useOnNewTransactions(wallet, (transactions) =>
    alert(`${name} - ${transactions.length > 1 ? 'New Transactions' : 'New Transaction'}`),
  )

  return (
    <>
      <ListGroup.Item variant={isSelected ? 'primary' : undefined}>
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

export const EnabledTokensList: React.FC<{ wallet: EdgeCurrencyWallet }> = ({ wallet }) => {
  const tokenCodes = useEnabledTokens(wallet)

  return tokenCodes.length > 0 ? (
    <ListGroup.Item>
      <ListGroup variant={'flush'}>
        {tokenCodes.map((currencyCode) => (
          <Boundary key={currencyCode}>
            <EnabledTokenRow wallet={wallet} currencyCode={currencyCode} />
          </Boundary>
        ))}
      </ListGroup>
    </ListGroup.Item>
  ) : null
}

const EnabledTokenRow: React.FC<{
  wallet: EdgeCurrencyWallet
  currencyCode: string
}> = ({ wallet, currencyCode }) => {
  return (
    <ListGroup.Item>
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
