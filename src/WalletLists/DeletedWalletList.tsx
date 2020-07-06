import { useChangeWalletState } from 'edge-react-hooks'
import * as React from 'react'
import { Button, ListGroup } from 'react-bootstrap'

import { useAccount } from '../Auth'
import { Boundary } from '../Components/Boundary'
import { DisplayAmount } from '../Components/DisplayAmount'
import { Logo } from '../Components/Logo'
import { FiatAmount } from '../Fiat'
import { getBalance, getDeletedWalletInfos } from '../utils'
import { FallbackRender } from './FallbackRender'
import { WalletState, useReadLastKnownWalletState } from './LastKnownWalletStates'

export const DeletedWalletList: React.FC = () => {
  const account = useAccount()
  const deletedWalletInfos = getDeletedWalletInfos({ account })

  return (
    <ListGroup variant={'flush'}>
      {deletedWalletInfos.map((walletInfo) => (
        // eslint-disable-next-line react/display-name
        <Boundary key={walletInfo.id} error={{ fallbackRender: () => <FallbackRender walletId={walletInfo.id} /> }}>
          <WalletRow walletId={walletInfo.id} />
        </Boundary>
      ))}
    </ListGroup>
  )
}

const WalletRow: React.FC<{
  walletId: string
}> = ({ walletId }) => {
  const account = useAccount()
  const walletState = useReadLastKnownWalletState({ account, walletId })
  const balance = getBalance({ wallet: walletState, currencyCode: walletState.currencyInfo.currencyCode })

  return (
    <ListGroup style={{ paddingTop: 4, paddingBottom: 4 }}>
      <ListGroup.Item>
        <span className={'float-left'}>
          <Logo walletType={walletState.type} /> {walletState.name}{' '}
          <Boundary>
            <DisplayAmount nativeAmount={balance} currencyInfo={walletState.currencyInfo} />
          </Boundary>{' '}
          -{' '}
          <FiatAmount
            currencyInfo={walletState.currencyInfo}
            toCurrencyCode={walletState.fiatCurrencyCode}
            nativeAmount={balance}
          />
        </span>

        <span className={'float-right'}>
          <WalletOptions walletState={walletState} />
        </span>
      </ListGroup.Item>
    </ListGroup>
  )
}

const WalletOptions = ({ walletState }: { walletState: WalletState }) => {
  const account = useAccount()
  const { execute: changeWalletState, error, status } = useChangeWalletState(account)
  const activateWallet = () =>
    changeWalletState({
      walletId: walletState.id,
      walletState: { archived: false, deleted: false },
    })

  return (
    <>
      <Button variant={'warning'} disabled={status === 'loading'} onClick={activateWallet}>
        Activate
      </Button>
      {error && <div>{error.message}</div>}
    </>
  )
}
