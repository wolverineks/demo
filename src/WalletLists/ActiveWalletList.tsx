import { EdgeCurrencyWallet } from 'edge-core-js'
import React from 'react'
import { Accordion, Button, ListGroup, ProgressBar } from 'react-bootstrap'

import { useEdgeAccount } from '../auth'
import { Balance, Boundary, Logo } from '../components'
import {
  useActiveWalletIds,
  useChangeWalletState,
  useEdgeCurrencyWallet,
  useEnabledTokens,
  useFiatCurrencyCode,
  useName,
  useOnNewTransactions,
  useSortWallets,
  useSyncRatio,
} from '../hooks'
import { useSelectedWalletInfo } from '../SelectedWallet'
import { normalize } from '../utils'

export const ActiveWalletList: React.FC<{ onSelect: () => void; searchQuery: string }> = ({
  onSelect,
  searchQuery,
}) => {
  const account = useEdgeAccount()
  const activeWalletIds = useActiveWalletIds(account)

  return (
    <Accordion defaultActiveKey={'0'}>
      <Accordion.Toggle as={ListGroup.Item} eventKey={'0'}>
        Active Wallets ({activeWalletIds.length})
      </Accordion.Toggle>

      <Accordion.Collapse eventKey={'0'}>
        <ListGroup variant={'flush'}>
          {activeWalletIds.map((id) => (
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
  const [name] = useName(wallet)
  const [fiatCurrencyCode] = useFiatCurrencyCode(wallet)

  const display = [name || '', wallet.currencyInfo.currencyCode, fiatCurrencyCode, ...enabledTokens].some((target) =>
    normalize(target).includes(normalize(searchQuery)),
  )

  return display ? <>{children}</> : null
}

const ActiveWalletRow: React.FC<{ walletId: string; onSelect: () => void }> = ({ walletId, onSelect }) => {
  const account = useEdgeAccount()
  const wallet = useEdgeCurrencyWallet({ account, walletId })
  const [name] = useName(wallet)
  const currencyCode = wallet.currencyInfo.currencyCode
  const [selected, select] = useSelectedWalletInfo()

  useOnNewTransactions(wallet, (transactions) =>
    alert(`${name} - ${transactions.length > 1 ? 'New Transactions' : 'New Transaction'}`),
  )

  return (
    <>
      <ListGroup.Item
        variant={wallet.id === selected?.id && currencyCode === selected?.currencyCode ? 'primary' : undefined}
      >
        <SyncRatio wallet={wallet} />
        <span
          onClick={() => {
            select({ id: walletId, currencyCode })
            onSelect()
          }}
          className={'float-left'}
        >
          <Logo currencyCode={currencyCode} /> {name}{' '}
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

const SyncRatio = ({ wallet }: { wallet: EdgeCurrencyWallet }) => {
  const syncRatio = useSyncRatio(wallet)

  return syncRatio < 1 ? <ProgressBar min={0} now={Math.max(syncRatio, 0.1)} max={1} striped animated /> : null
}

const WalletOptions = ({ walletId }: { walletId: string }) => {
  const account = useEdgeAccount()
  const { archiveWallet, deleteWallet, status } = useChangeWalletState(account, walletId)
  const sortWallets = useSortWallets(account)
  const activeWalletIds = useActiveWalletIds(account)

  const moveUp = () => {
    const currentIndex = activeWalletIds.indexOf(walletId)
    const newOrder = [...activeWalletIds].map((current, index, array) =>
      index === currentIndex - 1 ? walletId : index === currentIndex ? array[currentIndex - 1] : current,
    )

    sortWallets(newOrder)
  }

  const moveDown = () => {
    const currentIndex = activeWalletIds.indexOf(walletId)
    const newOrder = [...activeWalletIds].map((current, index, array) =>
      index === currentIndex + 1 ? walletId : index === currentIndex ? array[currentIndex + 1] : current,
    )

    sortWallets(newOrder)
  }

  const isTop = activeWalletIds[0] === walletId
  const isBottom = activeWalletIds[activeWalletIds.length - 1] === walletId

  return (
    <span className={'float-right'}>
      {!isTop ? (
        <Button disabled={status === 'loading'} onClick={moveUp}>
          ↑
        </Button>
      ) : null}
      {!isBottom ? (
        <Button disabled={status === 'loading'} onClick={moveDown}>
          ↓
        </Button>
      ) : null}
      <Button variant={'warning'} disabled={status === 'loading'} onClick={archiveWallet}>
        A
      </Button>
      <Button variant={'danger'} disabled={status === 'loading'} onClick={deleteWallet}>
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
