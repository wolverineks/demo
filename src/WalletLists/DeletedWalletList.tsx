import React from 'react'
import { Accordion, Button, ListGroup } from 'react-bootstrap'

import { useEdgeAccount } from '../auth'
import { Boundary, DisplayAmount, Logo } from '../components'
import { FiatAmount } from '../Fiat'
import { useChangeWalletStates, useInactiveWallets, useReadInactiveWallet } from '../hooks'
import { getDeletedWalletIds } from '../utils'
import { FallbackRender } from './FallbackRender'
import { getFilteredWalletIds } from './filter'

export const DeletedWalletList = ({ searchQuery }: { searchQuery: string }) => {
  const deletedWalletIds = getDeletedWalletIds(useEdgeAccount())
  const inactiveWallets = useInactiveWallets(useEdgeAccount())
  const visibleWalletIds = getFilteredWalletIds(inactiveWallets, deletedWalletIds, searchQuery)

  return (
    <Accordion>
      <Accordion.Toggle as={ListGroup.Item} eventKey={'0'}>
        Deleted Wallets ({visibleWalletIds.length})
      </Accordion.Toggle>

      <Accordion.Collapse eventKey={'0'}>
        <ListGroup variant={'flush'}>
          {visibleWalletIds.map((id) => (
            // eslint-disable-next-line react/display-name
            <Boundary key={id} error={{ fallbackRender: () => <FallbackRender walletId={id} /> }}>
              <WalletRow walletId={id} />
            </Boundary>
          ))}
        </ListGroup>
      </Accordion.Collapse>
    </Accordion>
  )
}

const WalletRow: React.FC<{ walletId: string }> = ({ walletId }) => {
  const inactiveWallet = useReadInactiveWallet(useEdgeAccount(), walletId)
  const balance = inactiveWallet.balances[inactiveWallet.currencyInfo.currencyCode]

  return (
    <ListGroup.Item>
      <span className={'float-left'}>
        <Logo currencyCode={inactiveWallet.currencyInfo.currencyCode} /> {inactiveWallet.name}{' '}
        <DisplayAmount nativeAmount={balance} currencyCode={inactiveWallet.currencyInfo.currencyCode} /> -{' '}
        <FiatAmount
          nativeAmount={balance}
          fromCurrencyCode={inactiveWallet.currencyInfo.currencyCode}
          fiatCurrencyCode={inactiveWallet.fiatCurrencyCode}
        />
      </span>

      <span className={'float-right'}>
        <WalletOptions walletId={inactiveWallet.id} />
      </span>
    </ListGroup.Item>
  )
}

const WalletOptions = ({ walletId }: { walletId: string }) => {
  const { activateWallet, archiveWallet, error, status } = useChangeWalletStates(useEdgeAccount())

  return (
    <>
      <Button variant={'warning'} disabled={status === 'loading'} onClick={() => activateWallet(walletId)}>
        A
      </Button>
      <Button variant={'warning'} disabled={status === 'loading'} onClick={() => archiveWallet(walletId)}>
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
