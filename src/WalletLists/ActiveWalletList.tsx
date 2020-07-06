import { EdgeAccount, EdgeCurrencyWallet, EdgeMetaToken } from 'edge-core-js'
import { useChangeWalletState, useOnNewTransactions, useWatchAll } from 'edge-react-hooks'
import * as React from 'react'
import { Button, Image, ListGroup } from 'react-bootstrap'
import { useQuery } from 'react-query'

import { Boundary } from '../Components/Boundary'
import { DisplayAmount } from '../Components/DisplayAmount'
import { Logo } from '../Components/Logo'
import { FiatAmount } from '../Fiat'
import { useSelectedWallet } from '../SelectedWallet'
import { getBalance } from '../utils'

export const ActiveWalletList: React.FC<{
  account: EdgeAccount
  onSelect: (wallet: EdgeCurrencyWallet) => any
}> = ({ account, onSelect }) => {
  useWatchAll(account)
  const selectedWallet = useSelectedWallet({ account })

  return (
    <ListGroup variant={'flush'}>
      {account.activeWalletIds.map((id) => (
        <Boundary key={id} suspense={{ fallback: <ListGroup.Item>Loading...</ListGroup.Item> }}>
          <ActiveWalletRow
            account={account}
            walletId={id}
            onSelect={onSelect}
            isSelected={!!selectedWallet && id === selectedWallet.id}
          />
        </Boundary>
      ))}
    </ListGroup>
  )
}

const useEdgeCurrencyWallet = ({ account, walletId }: { account: EdgeAccount; walletId: string }) =>
  useQuery({
    queryKey: ['wallet', walletId],
    queryFn: () => account.waitForCurrencyWallet(walletId),
    config: { suspense: true },
  }).data!

const ActiveWalletRow: React.FC<{
  account: EdgeAccount
  walletId: string
  isSelected: boolean
  onSelect: (wallet: EdgeCurrencyWallet) => any
}> = ({ account, walletId, onSelect, isSelected }) => {
  const wallet = useEdgeCurrencyWallet({ account, walletId })
  useWatchAll(account)
  useWatchAll(wallet)

  const balance = getBalance({ wallet, currencyCode: wallet.currencyInfo.currencyCode })

  useOnNewTransactions(wallet, (transactions) =>
    alert(`${wallet.name} - ${transactions.length > 1 ? 'New Transactions' : 'New Transaction'}`),
  )

  return (
    <ListGroup style={{ paddingTop: 4, paddingBottom: 4 }}>
      <ListGroup.Item variant={isSelected ? 'primary' : undefined}>
        <span onClick={() => onSelect(wallet)} className={'float-left'}>
          <Logo account={account} walletType={wallet.type} /> {wallet.name}{' '}
          <DisplayAmount account={account} nativeAmount={balance} currencyInfo={wallet.currencyInfo} /> -{' '}
          <FiatAmount
            account={account}
            currencyInfo={wallet.currencyInfo}
            toCurrencyCode={wallet.fiatCurrencyCode}
            nativeAmount={balance}
          />
        </span>

        <span className={'float-right'}>
          <WalletOptions account={account} wallet={wallet} />
        </span>
      </ListGroup.Item>

      <EnabledTokensList account={account} wallet={wallet} />
    </ListGroup>
  )
}

const WalletOptions = ({ account, wallet }: { account: EdgeAccount; wallet: EdgeCurrencyWallet }) => {
  const { execute: changeWalletState, status } = useChangeWalletState(account)
  const archiveWallet = () => changeWalletState({ walletId: wallet.id, walletState: { archived: true } })
  const deleteWallet = () => changeWalletState({ walletId: wallet.id, walletState: { deleted: true } })

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

const useEnabledTokens = ({ wallet }: { wallet: EdgeCurrencyWallet }) =>
  useQuery({
    queryKey: ['enabledTokens', wallet.id],
    queryFn: () => wallet.getEnabledTokens(),
    config: { suspense: true },
  }).data!

const useEnabledTokenInfos = ({ wallet }: { wallet: EdgeCurrencyWallet }) => {
  const enabledTokens = useEnabledTokens({ wallet })

  return wallet.currencyInfo.metaTokens.filter((tokenInfo) => enabledTokens.includes(tokenInfo.currencyCode))
}

export const EnabledTokensList: React.FC<{
  account: EdgeAccount
  wallet: EdgeCurrencyWallet
}> = ({ account, wallet }) => {
  useWatchAll(account)
  useWatchAll(wallet)

  const tokenInfos = useEnabledTokenInfos({ wallet })

  return tokenInfos.length > 0 ? (
    <ListGroup.Item>
      <ListGroup variant={'flush'}>
        {tokenInfos.map((tokenInfo) => (
          <EnabledTokenRow account={account} wallet={wallet} key={tokenInfo.currencyCode} tokenInfo={tokenInfo} />
        ))}
      </ListGroup>
    </ListGroup.Item>
  ) : null
}

const EnabledTokenRow: React.FC<{
  account: EdgeAccount
  wallet: EdgeCurrencyWallet
  tokenInfo: EdgeMetaToken
}> = ({ account, wallet, tokenInfo }) => {
  useWatchAll(account)
  useWatchAll(wallet)

  const { symbolImage } = tokenInfo
  const balance = wallet.balances[tokenInfo.currencyCode]

  return (
    <ListGroup.Item>
      <span className={'float-left'}>
        <Image src={symbolImage} />
        <DisplayAmount account={account} nativeAmount={balance} currencyInfo={tokenInfo} /> -{' '}
        <FiatAmount
          account={account}
          currencyInfo={tokenInfo}
          toCurrencyCode={wallet.fiatCurrencyCode}
          nativeAmount={balance}
        />
      </span>
    </ListGroup.Item>
  )
}
