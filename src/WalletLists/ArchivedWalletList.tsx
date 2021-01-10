import React from 'react'
import { Accordion, Button, ListGroup } from 'react-bootstrap'

import { useEdgeAccount } from '../auth'
import { Boundary, DisplayAmount, Logo } from '../components'
import { FiatAmount } from '../Fiat'
import { useChangeWalletStates, useInactiveWallets, useReadInactiveWallet } from '../hooks'
import { InactiveWallets } from '../InactiveWallets'
import { FallbackRender } from './FallbackRender'
import { getFilteredWalletIds } from './filter'

export const ArchivedWalletList = ({ searchQuery }: { searchQuery: string }) => {
  const account = useEdgeAccount()
  const inactiveWallets = useInactiveWallets(account)
  const visibleWalletIds = getFilteredWalletIds(inactiveWallets, account.archivedWalletIds, searchQuery)

  return (
    <Accordion>
      <InactiveWallets />
      <Accordion.Toggle as={ListGroup.Item} eventKey={'0'}>
        Archived Wallets ({visibleWalletIds.length})
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
