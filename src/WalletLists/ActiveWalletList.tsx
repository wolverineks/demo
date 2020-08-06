import { EdgeCurrencyWallet } from 'edge-core-js'
import { useOnNewTransactions } from 'edge-react-hooks'
import React from 'react'
import { Button, ListGroup } from 'react-bootstrap'

import { useAccount } from '../auth'
import { Boundary, DisplayAmount, Logo, Select } from '../components'
import { FiatAmount } from '../Fiat'
import {
  useActiveCurrencyInfos,
  useActiveWalletIds,
  useActiveWalletInfos,
  useBalance,
  useChangeWalletStates,
  useCurrencyWallets,
  useEnabledTokens,
  useName,
  useSortedCurrencyWallets,
  useWallet,
} from '../hooks'
import { useSelectedWallet } from '../SelectedWallet'

export const ActiveWalletList: React.FC<{
  onSelect: (walletId: string) => any
}> = ({ onSelect }) => {
  const account = useAccount()
  const activeWalletInfos = useActiveWalletInfos(account)
  const selectedWallet = useSelectedWallet()
  const currencyInfos = useActiveCurrencyInfos(account)
  const [filter, setFilter] = React.useState('none')

  return activeWalletInfos.length <= 0 ? (
    <div>No active wallets</div>
  ) : (
    <ListGroup variant={'flush'}>
      {currencyInfos.length > 1 && (
        <Select
          title={'Wallet Types'}
          options={[
            { value: 'none', display: '-' },
            ...currencyInfos.map((currencyInfo) => ({
              value: currencyInfo.walletType,
              display: currencyInfo.displayName,
            })),
          ]}
          renderOption={({ value, display }) => (
            <option value={value} key={value}>
              {display}
            </option>
          )}
          onSelect={(event) => setFilter(event.currentTarget.value)}
        />
      )}
      {activeWalletInfos
        .filter(filter === 'none' ? (x) => x : (walletInfo) => walletInfo.type === filter)
        .map(({ id }) => (
          <Boundary key={id} suspense={{ fallback: <ListGroup.Item>Loading...</ListGroup.Item> }}>
            <ActiveWalletRow walletId={id} onSelect={() => onSelect(id)} isSelected={id === selectedWallet.id} />
          </Boundary>
        ))}
    </ListGroup>
  )
}

const ActiveWalletRow: React.FC<{
  walletId: string
  onSelect: () => any
  isSelected: boolean
}> = ({ walletId, onSelect, isSelected }) => {
  const wallet = useWallet(useAccount(), walletId)
  const currencyCode = wallet.currencyInfo.currencyCode
  const balance = useBalance(wallet, currencyCode) || '0'
  const name = useName(wallet)

  useOnNewTransactions(wallet, (transactions) =>
    alert(`${name} - ${transactions.length > 1 ? 'New Transactions' : 'New Transaction'}`),
  )

  return (
    <ListGroup style={{ paddingTop: 4, paddingBottom: 4 }}>
      <ListGroup.Item variant={isSelected ? 'primary' : undefined}>
        <span onClick={() => onSelect()} className={'float-left'}>
          <Logo currencyCode={currencyCode} /> {name}{' '}
          <DisplayAmount nativeAmount={balance} currencyCode={currencyCode} /> -{' '}
          <FiatAmount
            nativeAmount={balance}
            fromCurrencyCode={currencyCode}
            fiatCurrencyCode={wallet.fiatCurrencyCode}
          />
        </span>

        <WalletOptions walletId={wallet.id} />
      </ListGroup.Item>

      <EnabledTokensList wallet={wallet} />
    </ListGroup>
  )
}

const WalletOptions = ({ walletId }: { walletId: string }) => {
  const { archiveWallet, deleteWallet, status } = useChangeWalletStates(useAccount())

  return (
    <span className={'float-right'}>
      <Button variant={'danger'} disabled={status === 'loading'} onClick={() => deleteWallet(walletId)}>
        Delete
      </Button>
      <Button variant={'warning'} disabled={status === 'loading'} onClick={() => archiveWallet(walletId)}>
        Archive
      </Button>
    </span>
  )
}

export const EnabledTokensList: React.FC<{ wallet: EdgeCurrencyWallet }> = ({ wallet }) => {
  const tokenCodes = useEnabledTokens(wallet)

  return tokenCodes.length > 0 ? (
    <ListGroup.Item>
      <ListGroup variant={'flush'}>
        {tokenCodes.map((currencyCode) => (
          <Boundary key={currencyCode}>
            <EnabledTokenRow wallet={wallet} currencyCode={currencyCode} />
          </Boundary>
        ))}
      </ListGroup>
    </ListGroup.Item>
  ) : null
}

const EnabledTokenRow: React.FC<{
  wallet: EdgeCurrencyWallet
  currencyCode: string
}> = ({ wallet, currencyCode }) => {
  return (
    <ListGroup.Item>
      <span className={'float-left'}>
        <Logo currencyCode={currencyCode} />
        <Boundary suspense={{ fallback: <span>Loading...</span> }}>
          <Amounts wallet={wallet} currencyCode={currencyCode} />
        </Boundary>
      </span>
    </ListGroup.Item>
  )
}

const Amounts: React.FC<{ wallet: EdgeCurrencyWallet; currencyCode: string }> = ({ wallet, currencyCode }) => {
  const balance = useBalance(wallet, currencyCode) || '0'

  return (
    <>
      <DisplayAmount nativeAmount={balance} currencyCode={currencyCode} /> -{' '}
      <FiatAmount nativeAmount={balance} fromCurrencyCode={currencyCode} fiatCurrencyCode={wallet.fiatCurrencyCode} />
    </>
  )
}
