import React from 'react'
import { Accordion, Button, ListGroup } from 'react-bootstrap'

import { useEdgeAccount } from '../auth'
import { Boundary, DisplayAmount, FiatAmount, Logo } from '../components'
import { useChangeWalletStates, useReadWalletSnapshot } from '../hooks'
import { getBalance, normalize } from '../utils'
import { WalletSnapshots } from '../WalletSnapshots'
import { FallbackRender } from './FallbackRender'

export const ArchivedWalletList = ({ searchQuery }: { searchQuery: string }) => {
  const account = useEdgeAccount()

  return (
    <Accordion>
      <WalletSnapshots />
      <Accordion.Toggle as={ListGroup.Item} eventKey={'0'}>
        Archived Wallets ({account.archivedWalletIds.length})
      </Accordion.Toggle>

      <Accordion.Collapse eventKey={'0'}>
        <ListGroup variant={'flush'}>
          {account.archivedWalletIds.map((id) => (
            // eslint-disable-next-line react/display-name
            <Boundary key={id} error={{ fallbackRender: () => <FallbackRender walletId={id} /> }}>
              <Matcher walletId={id} searchQuery={searchQuery}>
                <WalletRow walletId={id} />
              </Matcher>
            </Boundary>
          ))}
        </ListGroup>
      </Accordion.Collapse>
    </Accordion>
  )
}

const Matcher: React.FC<{ walletId: string; searchQuery: string }> = ({ walletId, searchQuery, children }) => {
  const snapshot = useReadWalletSnapshot(useEdgeAccount(), walletId)
  const display = [snapshot.name || '', snapshot.currencyInfo.currencyCode, snapshot.fiatCurrencyCode].some((target) =>
    normalize(target).includes(normalize(searchQuery)),
  )

  return display ? <>{children}</> : null
}

const WalletRow: React.FC<{ walletId: string }> = ({ walletId }) => {
  const snapshot = useReadWalletSnapshot(useEdgeAccount(), walletId)
  const balance = getBalance(snapshot, snapshot.currencyInfo.currencyCode) || '0'

  return (
    <ListGroup.Item>
      <span className={'float-left'}>
        <Logo currencyCode={snapshot.currencyInfo.currencyCode} /> {snapshot.name}{' '}
        <DisplayAmount nativeAmount={balance} currencyCode={snapshot.currencyInfo.currencyCode} /> -{' '}
        <FiatAmount
          nativeAmount={balance}
          fromCurrencyCode={snapshot.currencyInfo.currencyCode}
          fiatCurrencyCode={snapshot.fiatCurrencyCode}
        />
      </span>

      <span className={'float-right'}>
        <WalletOptions walletId={snapshot.id} />
      </span>
    </ListGroup.Item>
  )
}

const WalletOptions = ({ walletId }: { walletId: string }) => {
  const { activateWallet, deleteWallet, error, status } = useChangeWalletStates(useEdgeAccount())

  return (
    <>
      <Button variant={'warning'} disabled={status === 'loading'} onClick={() => activateWallet(walletId)}>
        A
      </Button>
      <Button variant={'danger'} disabled={status === 'loading'} onClick={() => deleteWallet(walletId)}>
        X
      </Button>
      {error && <DisplayError error={error} />}
    </>
  )
}

const DisplayError: React.FC<{ error: unknown }> = ({ error }) => {
  if (error instanceof Error) {
    return <div>{error.message}</div>
  }

  throw error
}
