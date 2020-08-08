import React from 'react'
import { Button, FormControl, ListGroup } from 'react-bootstrap'

import { useAccount } from '../auth'
import { Boundary, DisplayAmount, Logo } from '../components'
import { FiatAmount } from '../Fiat'
import { useArchivedWalletIds, useChangeWalletStates, useInactiveWallets, useReadInactiveWallet } from '../hooks'
import { InactiveWallets } from '../InactiveWallets'
import { FallbackRender } from './FallbackRender'
import { useFilteredWalletIds } from './filter'

export const ArchivedWalletList: React.FC = () => {
  const archivedWalletIds = useArchivedWalletIds(useAccount())
  const [query, setQuery] = React.useState('')
  const inactiveWallets = useInactiveWallets(useAccount())
  const visibleWalletIds = useFilteredWalletIds(inactiveWallets, archivedWalletIds, query)

  return archivedWalletIds.length <= 0 ? (
    <div>No archived wallets</div>
  ) : (
    <>
      <InactiveWallets />
      <ListGroup variant={'flush'}>
        <FormControl placeholder={'Search'} onChange={(event) => setQuery(event.currentTarget.value)} />
        {visibleWalletIds.length <= 0 && <div>No Matching wallets</div>}
        {visibleWalletIds.map((id) => (
          // eslint-disable-next-line react/display-name
          <Boundary key={id} error={{ fallbackRender: () => <FallbackRender walletId={id} /> }}>
            <WalletRow walletId={id} />
          </Boundary>
        ))}
      </ListGroup>
    </>
  )
}

const WalletRow: React.FC<{ walletId: string }> = ({ walletId }) => {
  const inactiveWallet = useReadInactiveWallet(useAccount(), walletId)
  const balance = inactiveWallet.balances[inactiveWallet.currencyInfo.currencyCode]

  return (
    <ListGroup style={{ paddingTop: 4, paddingBottom: 4 }}>
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
    </ListGroup>
  )
}

const WalletOptions = ({ walletId }: { walletId: string }) => {
  const { activateWallet, deleteWallet, error, status } = useChangeWalletStates(useAccount())

  return (
    <>
      <Button variant={'warning'} disabled={status === 'loading'} onClick={() => activateWallet(walletId)}>
        Activate
      </Button>
      <Button variant={'danger'} disabled={status === 'loading'} onClick={() => deleteWallet(walletId)}>
        Delete
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
