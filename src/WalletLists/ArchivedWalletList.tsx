import React from 'react'

import { useEdgeAccount } from '../auth'
import { Accordion, Boundary, Button, ListGroup } from '../components'
import { useArchivedWalletIds, useChangeWalletState, useReadWalletSnapshot } from '../hooks'
import { WalletSnapshots } from '../WalletSnapshots'
import { FallbackRender } from './FallbackRender'
import { inactiveWalletMatches, InactiveWalletRows } from './InactiveWalletRows'

export const ArchivedWalletList = ({ searchQuery }: { searchQuery: string }) => {
  const account = useEdgeAccount()
  const archivedWalletIds = useArchivedWalletIds(account)

  return (
    <Accordion>
      <WalletSnapshots />
      <Accordion.Toggle as={ListGroup.Item} eventKey={'0'}>
        Archived Wallets ({archivedWalletIds.length})
      </Accordion.Toggle>

      <Accordion.Collapse eventKey={'0'}>
        <ListGroup variant={'flush'}>
          {archivedWalletIds.map((id) => (
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
  const account = useEdgeAccount()
  const snapshot = useReadWalletSnapshot(account, walletId)

  return inactiveWalletMatches(account, snapshot, searchQuery) ? <>{children}</> : null
}

const WalletRow: React.FC<{ walletId: string }> = ({ walletId }) => {
  const account = useEdgeAccount()
  const snapshot = useReadWalletSnapshot(account, walletId)

  return <InactiveWalletRows snapshot={snapshot} actions={<WalletOptions walletId={snapshot.id} />} />
}

const WalletOptions = ({ walletId }: { walletId: string }) => {
  const account = useEdgeAccount()
  const { activateWallet, deleteWallet, error, status } = useChangeWalletState(account, walletId)

  return (
    <>
      <Button size="sm" variant={'warning'} disabled={status === 'loading'} onClick={activateWallet}>
        A
      </Button>
      <Button size="sm" variant={'danger'} disabled={status === 'loading'} onClick={deleteWallet}>
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
