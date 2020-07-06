import { EdgeAccount } from 'edge-core-js'
import { useChangeWalletState, useWatchAll } from 'edge-react-hooks'
import * as React from 'react'
import { Button, ListGroup } from 'react-bootstrap'

import { Boundary } from '../Components/Boundary'
import { DisplayAmount } from '../Components/DisplayAmount'
import { Logo } from '../Components/Logo'
import { FiatAmount } from '../Fiat'
import { getArchivedWalletInfos, getBalance } from '../utils'
import { LastKnownWalletStates, useReadLastKnownWalletState } from './LastKnownWalletStates'

export const ArchivedWalletList: React.FC<{ account: EdgeAccount }> = ({ account }) => {
  useWatchAll(account)
  const archivedWalletInfos = getArchivedWalletInfos({ account })

  return (
    <>
      <LastKnownWalletStates account={account} />
      <ListGroup variant={'flush'}>
        {archivedWalletInfos.map((walletInfo) => (
          <Boundary key={walletInfo.id}>
            <WalletRow account={account} walletId={walletInfo.id} />
          </Boundary>
        ))}
      </ListGroup>
    </>
  )
}

const WalletRow: React.FC<{
  account: EdgeAccount
  walletId: string
}> = ({ account, walletId }) => {
  useWatchAll(account)
  const walletState = useReadLastKnownWalletState({ account, walletId })
  const balance = getBalance({ wallet: walletState, currencyCode: walletState.currencyInfo.currencyCode })

  return (
    <ListGroup style={{ paddingTop: 4, paddingBottom: 4 }}>
      <ListGroup.Item>
        <span className={'float-left'}>
          <Logo account={account} walletType={walletState.type} /> {walletState.name}{' '}
          <DisplayAmount account={account} nativeAmount={balance} currencyInfo={walletState.currencyInfo} /> -{' '}
          <FiatAmount
            account={account}
            currencyInfo={walletState.currencyInfo}
            toCurrencyCode={walletState.fiatCurrencyCode}
            nativeAmount={balance}
          />
        </span>

        <span className={'float-right'}>
          <WalletOptions account={account} walletId={walletState.id} />
        </span>
      </ListGroup.Item>
    </ListGroup>
  )
}

const WalletOptions = ({ account, walletId }: { account: EdgeAccount; walletId: string }) => {
  const { execute: changeWalletState, error, status } = useChangeWalletState(account)
  const activateWallet = () => changeWalletState({ walletId, walletState: { archived: false } })
  const deleteWallet = () => changeWalletState({ walletId, walletState: { deleted: true } })

  return (
    <>
      <Button variant={'danger'} disabled={status === 'loading'} onClick={deleteWallet}>
        Delete
      </Button>
      <Button variant={'warning'} disabled={status === 'loading'} onClick={activateWallet}>
        Activate
      </Button>
      {error && <div>{error.message}</div>}
    </>
  )
}
