import React from 'react'
import { Button, ListGroup } from 'react-bootstrap'

import { useAccount } from '../auth'
import { Boundary, DisplayAmount, Logo } from '../components'
import { FiatAmount } from '../Fiat'
import { useArchivedWalletIds, useChangeWalletStates, useReadInactiveWallet } from '../hooks'
import { InactiveWallets } from '../InactiveWallets'
import { FallbackRender } from './FallbackRender'

export const ArchivedWalletList: React.FC = () => {
  const archivedWalletIds = useArchivedWalletIds(useAccount())

  return archivedWalletIds.length <= 0 ? (
    <div>No archived wallets</div>
  ) : (
    <>
      <InactiveWallets />
      <ListGroup variant={'flush'}>
        {archivedWalletIds.map((id) => (
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
  const { activateWallet, deleteWallet, error, status } = useChangeWalletStates(useAccount(), walletId)

  return (
    <>
      <Button variant={'warning'} disabled={status === 'loading'} onClick={activateWallet}>
        Activate
      </Button>
      <Button variant={'danger'} disabled={status === 'loading'} onClick={deleteWallet}>
        Delete
      </Button>
      {error && <div>{error.message}</div>}
    </>
  )
}
