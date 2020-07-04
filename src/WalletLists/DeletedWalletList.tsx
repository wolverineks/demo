import { EdgeAccount } from 'edge-core-js'
import { useChangeWalletState, useWatchAll } from 'edge-react-hooks'
import * as React from 'react'
import { Button, ListGroup } from 'react-bootstrap'

import { Boundary } from '../Components/Boundary'
import { DisplayAmount } from '../Components/DisplayAmount'
import { Logo } from '../Components/Logo'
import { FiatAmount } from '../Fiat'
import { getDeletedWalletInfos } from '../utils'
import { WalletState, useReadLastKnownWalletState } from './LastKnownWalletStates'

export const DeletedWalletList: React.FC<{ account: EdgeAccount }> = ({ account }) => {
  useWatchAll(account)
  const deletedWalletInfos = getDeletedWalletInfos({ account })

  return (
    <ListGroup variant={'flush'}>
      {deletedWalletInfos.map((walletInfo) => (
        <Boundary key={walletInfo.id}>
          <WalletRow account={account} walletId={walletInfo.id} />
        </Boundary>
      ))}
    </ListGroup>
  )
}

const WalletRow: React.FC<{
  account: EdgeAccount
  walletId: string
}> = ({ account, walletId }) => {
  useWatchAll(account)
  const walletState = useReadLastKnownWalletState({ account, walletId })
  const balance = walletState.balances[walletState.currencyInfo.currencyCode]

  return (
    <ListGroup style={{ paddingTop: 4, paddingBottom: 4 }}>
      <ListGroup.Item>
        <span className={'float-left'}>
          <Logo account={account} walletType={walletState.type} /> {walletState.name}{' '}
          <Boundary>
            <DisplayAmount account={account} nativeAmount={balance} currencyInfo={walletState.currencyInfo} />
          </Boundary>{' '}
          -{' '}
          <FiatAmount
            account={account}
            currencyInfo={walletState.currencyInfo}
            toCurrencyCode={walletState.fiatCurrencyCode}
            nativeAmount={balance}
          />
        </span>

        <span className={'float-right'}>
          <WalletOptions account={account} walletState={walletState} />
        </span>
      </ListGroup.Item>
    </ListGroup>
  )
}

const WalletOptions = ({ account, walletState }: { account: EdgeAccount; walletState: WalletState }) => {
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
