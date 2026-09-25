import React from 'react'

import { useEdgeAccount } from '../auth'
import { Accordion, Boundary, Button, ListGroup } from '../components'
import { useChangeWalletState, useDeletedWalletIds, useReadWalletSnapshot } from '../hooks'
import { FallbackRender } from './FallbackRender'
import { inactiveWalletMatches, InactiveWalletRows } from './InactiveWalletRows'

export const DeletedWalletList = ({ searchQuery }: { searchQuery: string }) => {
  const deletedWalletIds = useDeletedWalletIds()

  return (
    <Accordion>
      <Accordion.Toggle as={ListGroup.Item} eventKey={'0'}>
        Deleted Wallets ({deletedWalletIds.length})
      </Accordion.Toggle>

      <Accordion.Collapse eventKey={'0'}>
        <ListGroup variant={'flush'}>
          {deletedWalletIds.map((id) => (
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
  const { activateWallet, archiveWallet, error, status } = useChangeWalletState(walletId)

  return (
    <>
      <Button size="sm" variant={'warning'} disabled={status === 'loading'} onClick={activateWallet}>
        A
      </Button>
      <Button size="sm" variant={'warning'} disabled={status === 'loading'} onClick={archiveWallet}>
        A
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
