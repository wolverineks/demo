import { EdgeCurrencyWallet } from 'edge-core-js'
import React from 'react'
import { Accordion, Button, ListGroup, ProgressBar } from 'react-bootstrap'

import { useEdgeAccount } from '../auth'
import { Balance, Boundary, Logo } from '../components'
import { useChangeWalletStates, useEdgeCurrencyWallet, useEnabledTokens, useOnNewTransactions } from '../hooks'
import { useSelectedWalletInfo } from '../SelectedWallet'
import { normalize } from '../utils'

export const ActiveWalletList: React.FC<{ onSelect: () => void; searchQuery: string }> = ({
  onSelect,
  searchQuery,
}) => {
  const account = useEdgeAccount()

  return (
    <Accordion defaultActiveKey={'0'}>
      <Accordion.Toggle as={ListGroup.Item} eventKey={'0'}>
        Active Wallets ({account.activeWalletIds.length})
      </Accordion.Toggle>

      <Accordion.Collapse eventKey={'0'}>
        <ListGroup variant={'flush'}>
          {account.activeWalletIds.map((id) => (
            <Boundary key={id} suspense={{ fallback: <ListGroup.Item>Loading...</ListGroup.Item> }}>
              <Matcher walletId={id} searchQuery={searchQuery}>
                <ActiveWalletRow walletId={id} onSelect={onSelect} />
              </Matcher>
            </Boundary>
          ))}
        </ListGroup>
      </Accordion.Collapse>
    </Accordion>
  )
}

const Matcher: React.FC<{ walletId: string; searchQuery: string }> = ({ walletId, searchQuery, children }) => {
  const wallet = useEdgeCurrencyWallet({ account: useEdgeAccount(), walletId })
  const enabledTokens = useEnabledTokens(wallet)
  const display = [
    wallet.name || '',
    wallet.currencyInfo.currencyCode,
    wallet.fiatCurrencyCode,
    ...enabledTokens,
  ].some((target) => normalize(target).includes(normalize(searchQuery)))

  return display ? <>{children}</> : null
}

const ActiveWalletRow: React.FC<{ walletId: string; onSelect: () => void }> = ({ walletId, onSelect }) => {
  const account = useEdgeAccount()
  const wallet = useEdgeCurrencyWallet({ account, walletId })
  const currencyCode = wallet.currencyInfo.currencyCode
  const [selected, select] = useSelectedWalletInfo()

  useOnNewTransactions(wallet, (transactions) =>
    alert(`${wallet.name} - ${transactions.length > 1 ? 'New Transactions' : 'New Transaction'}`),
  )

  return (
    <>
      <ListGroup.Item
        variant={wallet.id === selected?.id && currencyCode === selected?.currencyCode ? 'primary' : undefined}
      >
        {wallet.syncRatio < 1 && <ProgressBar min={0} now={Math.max(wallet.syncRatio, 0.1)} max={1} striped animated />}
        <span
          onClick={() => {
            select({ id: walletId, currencyCode })
            onSelect()
          }}
          className={'float-left'}
        >
          <Logo currencyCode={currencyCode} /> {wallet.name}{' '}
          <Boundary>
            <Balance wallet={wallet} currencyCode={currencyCode} />
          </Boundary>
        </span>

        <WalletOptions walletId={wallet.id} />
      </ListGroup.Item>

      <EnabledTokensList wallet={wallet} onSelect={onSelect} />
    </>
  )
}

const WalletOptions = ({ walletId }: { walletId: string }) => {
  const { archiveWallet, deleteWallet, status } = useChangeWalletStates(useEdgeAccount())

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
  const [selected, select] = useSelectedWalletInfo()

  return (
    <ListGroup.Item
      variant={wallet.id === selected?.id && currencyCode === selected?.currencyCode ? 'primary' : undefined}
      onClick={() => {
        onSelect()
        select({ id: wallet.id, currencyCode })
      }}
    >
      <span className={'float-left'}>
        <Logo currencyCode={currencyCode} />
        <Boundary suspense={{ fallback: <span>Loading...</span> }}>
          <Balance wallet={wallet} currencyCode={currencyCode} />
        </Boundary>
      </span>
    </ListGroup.Item>
  )
}
