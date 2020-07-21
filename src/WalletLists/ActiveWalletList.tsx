import { EdgeCurrencyWallet, EdgeMetaToken } from 'edge-core-js'
import { useOnNewTransactions } from 'edge-react-hooks'
import React from 'react'
import { Button, Image, ListGroup } from 'react-bootstrap'

import { useAccount } from '../auth'
import { Boundary, DisplayAmount, Logo } from '../components'
import { FiatAmount } from '../Fiat'
import {
  useActiveWalletIds,
  useBalance,
  useChangeWalletStates,
  useEnabledTokenInfos,
  useName,
  useWallet,
} from '../hooks'
import { useSelectedWallet } from '../SelectedWallet'

export const ActiveWalletList: React.FC<{
  onSelect: (walletId: string) => any
}> = ({ onSelect }) => {
  const activeWalletIds = useActiveWalletIds(useAccount())

  return activeWalletIds.length <= 0 ? (
    <div>No active wallets</div>
  ) : (
    <ListGroup variant={'flush'}>
      {activeWalletIds.map((id) => (
        <Boundary key={id} suspense={{ fallback: <ListGroup.Item>Loading...</ListGroup.Item> }}>
          <ActiveWalletRow walletId={id} onSelect={() => onSelect(id)} />
        </Boundary>
      ))}
    </ListGroup>
  )
}

const ActiveWalletRow: React.FC<{
  walletId: string
  onSelect: () => any
}> = ({ walletId, onSelect }) => {
  const wallet = useWallet(useAccount(), walletId)
  const selectedWallet = useSelectedWallet()
  const balance = useBalance(wallet, wallet.currencyInfo.currencyCode)
  const name = useName(wallet)

  useOnNewTransactions(wallet, (transactions) =>
    alert(`${name} - ${transactions.length > 1 ? 'New Transactions' : 'New Transaction'}`),
  )

  return (
    <ListGroup style={{ paddingTop: 4, paddingBottom: 4 }}>
      <ListGroup.Item variant={wallet.id === selectedWallet.id ? 'primary' : undefined}>
        <span onClick={() => onSelect()} className={'float-left'}>
          <Logo walletType={wallet.type} /> {name}{' '}
          <DisplayAmount nativeAmount={balance} currencyInfo={wallet.currencyInfo} /> -{' '}
          <FiatAmount
            currencyInfo={wallet.currencyInfo}
            toCurrencyCode={wallet.fiatCurrencyCode}
            nativeAmount={balance}
          />
        </span>

        <span className={'float-right'}>
          <WalletOptions walletId={wallet.id} />
        </span>
      </ListGroup.Item>

      <EnabledTokensList wallet={wallet} />
    </ListGroup>
  )
}

const WalletOptions = ({ walletId }: { walletId: string }) => {
  const { archiveWallet, deleteWallet, status } = useChangeWalletStates(useAccount(), walletId)

  return (
    <>
      <Button variant={'danger'} disabled={status === 'loading'} onClick={deleteWallet}>
        Delete
      </Button>
      <Button variant={'warning'} disabled={status === 'loading'} onClick={archiveWallet}>
        Archive
      </Button>
    </>
  )
}

export const EnabledTokensList: React.FC<{ wallet: EdgeCurrencyWallet }> = ({ wallet }) => {
  const tokenInfos = useEnabledTokenInfos(wallet)

  return tokenInfos.length > 0 ? (
    <ListGroup.Item>
      <ListGroup variant={'flush'}>
        {tokenInfos.map((tokenInfo) => (
          <EnabledTokenRow wallet={wallet} key={tokenInfo.currencyCode} tokenInfo={tokenInfo} />
        ))}
      </ListGroup>
    </ListGroup.Item>
  ) : null
}

const EnabledTokenRow: React.FC<{
  wallet: EdgeCurrencyWallet
  tokenInfo: EdgeMetaToken
}> = ({ wallet, tokenInfo }) => {
  const { symbolImage } = tokenInfo
  const balance = useBalance(wallet, tokenInfo.currencyCode)

  return (
    <ListGroup.Item>
      <span className={'float-left'}>
        <Image src={symbolImage} />
        <DisplayAmount nativeAmount={balance} currencyInfo={tokenInfo} /> -{' '}
        <FiatAmount currencyInfo={tokenInfo} toCurrencyCode={wallet.fiatCurrencyCode} nativeAmount={balance} />
      </span>
    </ListGroup.Item>
  )
}
