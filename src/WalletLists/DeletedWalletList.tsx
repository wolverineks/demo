import React from 'react'
import { Accordion, Button, ListGroup } from 'react-bootstrap'

import { useAccount } from '../auth'
import { Boundary, DisplayAmount, Logo } from '../components'
import { FiatAmount } from '../Fiat'
import { useChangeWalletStates, useDeletedWalletIds, useInactiveWallets, useReadInactiveWallet } from '../hooks'
import { useSearchQuery } from '../search'
import { FallbackRender } from './FallbackRender'
import { useFilteredWalletIds } from './filter'

export const DeletedWalletList = () => {
  const deletedWalletIds = useDeletedWalletIds(useAccount())
  const searchQuery = useSearchQuery()
  const inactiveWallets = useInactiveWallets(useAccount())
  const visibleWalletIds = useFilteredWalletIds(inactiveWallets, deletedWalletIds, searchQuery)

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

const WalletRow: React.FC<{
  walletId: string
}> = ({ walletId }) => {
  const inactiveWallet = useReadInactiveWallet(useAccount(), walletId)
  const balance = inactiveWallet.balances[inactiveWallet.currencyInfo.currencyCode]

  return (
    <ListGroup.Item>
      <span className={'float-left'}>
        <Logo currencyCode={inactiveWallet.currencyInfo.currencyCode} /> {inactiveWallet.name}{' '}
        <Boundary>
          <DisplayAmount nativeAmount={balance} currencyCode={inactiveWallet.currencyInfo.currencyCode} />
        </Boundary>{' '}
        -{' '}
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
  const { activateWallet, archiveWallet, error, status } = useChangeWalletStates(useAccount())

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
