import { useChangeWalletState } from 'edge-react-hooks'
import * as React from 'react'
import { Button, ListGroup } from 'react-bootstrap'

import { useAccount } from '../Auth'
import { Boundary } from '../Components/Boundary'
import { DisplayAmount } from '../Components/DisplayAmount'
import { Logo } from '../Components/Logo'
import { FiatAmount } from '../Fiat'
import { getArchivedWalletInfos, getBalance } from '../utils'
import { FallbackRender } from './FallbackRender'
import { LastKnownWalletStates, useReadLastKnownWalletState } from './LastKnownWalletStates'

export const ArchivedWalletList: React.FC = () => {
  const account = useAccount()
  const archivedWalletInfos = getArchivedWalletInfos({ account })

  return (
    <>
      <LastKnownWalletStates />
      <ListGroup variant={'flush'}>
        {archivedWalletInfos.map((walletInfo) => (
          // eslint-disable-next-line react/display-name
          <Boundary key={walletInfo.id} error={{ fallbackRender: () => <FallbackRender walletId={walletInfo.id} /> }}>
            <WalletRow walletId={walletInfo.id} />
          </Boundary>
        ))}
      </ListGroup>
    </>
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
          <DisplayAmount nativeAmount={balance} currencyInfo={walletState.currencyInfo} /> -{' '}
          <FiatAmount
            currencyInfo={walletState.currencyInfo}
            toCurrencyCode={walletState.fiatCurrencyCode}
            nativeAmount={balance}
          />
        </span>

        <span className={'float-right'}>
          <WalletOptions walletId={walletState.id} />
        </span>
      </ListGroup.Item>
    </ListGroup>
  )
}

const WalletOptions = ({ walletId }: { walletId: string }) => {
  const account = useAccount()
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
