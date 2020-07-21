import React from 'react'
import { Button, ListGroup } from 'react-bootstrap'

import { useAccount } from '../auth'
import { Boundary, DisplayAmount, Logo } from '../components'
import { FiatAmount } from '../Fiat'
import {
  useDeletedWalletIds,
  useReadInactiveWallet,
  useChangeWalletStates as usseActivateArchiveDelete,
} from '../hooks'
import { FallbackRender } from './FallbackRender'

export const DeletedWalletList: React.FC = () => {
  const deletedWalletIds = useDeletedWalletIds(useAccount())

  return deletedWalletIds.length <= 0 ? (
    <div>No deleted wallets</div>
  ) : (
    <ListGroup variant={'flush'}>
      {deletedWalletIds.map((id) => (
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
          <Logo walletType={inactiveWallet.type} /> {inactiveWallet.name}{' '}
          <Boundary>
            <DisplayAmount nativeAmount={balance} currencyInfo={inactiveWallet.currencyInfo} />
          </Boundary>{' '}
          -{' '}
          <FiatAmount
            currencyInfo={inactiveWallet.currencyInfo}
            toCurrencyCode={inactiveWallet.fiatCurrencyCode}
            nativeAmount={balance}
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
  const { activateWallet, archiveWallet, error, status } = usseActivateArchiveDelete(useAccount(), walletId)

  return (
    <>
      <Button variant={'warning'} disabled={status === 'loading'} onClick={activateWallet}>
        Activate
      </Button>
      <Button variant={'warning'} disabled={status === 'loading'} onClick={archiveWallet}>
        Archive
      </Button>
      {error && <div>{error.message}</div>}
    </>
  )
}
