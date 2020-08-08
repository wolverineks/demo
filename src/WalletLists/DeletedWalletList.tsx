import React from 'react'
import { Button, FormControl, ListGroup } from 'react-bootstrap'

import { useAccount } from '../auth'
import { Boundary, DisplayAmount, Logo } from '../components'
import { FiatAmount } from '../Fiat'
import { useChangeWalletStates, useDeletedWalletIds, useInactiveWallets, useReadInactiveWallet } from '../hooks'
import { FallbackRender } from './FallbackRender'
import { useFilteredWalletIds } from './filter'

export const DeletedWalletList: React.FC = () => {
  const deletedWalletIds = useDeletedWalletIds(useAccount())
  const [query, setQuery] = React.useState('')
  const inactiveWallets = useInactiveWallets(useAccount())
  const visibleWalletIds = useFilteredWalletIds(inactiveWallets, deletedWalletIds, query)

  console.log('qwe')

  return deletedWalletIds.length <= 0 ? (
    <div>No deleted wallets</div>
  ) : (
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
  )
}

const WalletRow: React.FC<{
  walletId: string
}> = ({ walletId }) => {
  const inactiveWallet = useReadInactiveWallet(useAccount(), walletId)
  const balance = inactiveWallet.balances[inactiveWallet.currencyInfo.currencyCode]

  return (
    <ListGroup style={{ paddingTop: 4, paddingBottom: 4 }}>
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
    </ListGroup>
  )
}

const WalletOptions = ({ walletId }: { walletId: string }) => {
  const { activateWallet, archiveWallet, error, status } = useChangeWalletStates(useAccount())

  return (
    <>
      <Button variant={'warning'} disabled={status === 'loading'} onClick={() => activateWallet(walletId)}>
        Activate
      </Button>
      <Button variant={'warning'} disabled={status === 'loading'} onClick={() => archiveWallet(walletId)}>
        Archive
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
