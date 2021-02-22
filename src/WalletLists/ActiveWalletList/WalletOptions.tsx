import { EdgeAccount } from 'edge-core-js'
import React from 'react'

import { useEdgeAccount } from '../../auth'
import { Button } from '../../components'
import { useActiveWalletIds, useChangeWalletState, useSortWallets, useSplitWallet } from '../../hooks'

export const WalletOptions = ({ walletId }: { walletId: string }) => {
  const account = useEdgeAccount()
  const activeWalletIds = useActiveWalletIds(account)

  const isTop = activeWalletIds[0] === walletId
  const isBottom = activeWalletIds[activeWalletIds.length - 1] === walletId

  return (
    <span className={'float-right'}>
      {!isTop ? <MoveUpButton walletId={walletId} /> : null}
      {!isBottom ? <MoveDownButton walletId={walletId} /> : null}
      <ArchiveWalletButton walletId={walletId} />
      <DeleteWalletButton walletId={walletId} />
      <SplitWalletButtons walletId={walletId} />
    </span>
  )
}

const ArchiveWalletButton = ({ walletId }: { walletId: string }) => {
  const account = useEdgeAccount()
  const { archiveWallet, isLoading } = useChangeWalletState(account, walletId)

  return (
    <Button variant={'warning'} disabled={isLoading} onClick={archiveWallet}>
      A
    </Button>
  )
}

const DeleteWalletButton = ({ walletId }: { walletId: string }) => {
  const account = useEdgeAccount()
  const { deleteWallet, isLoading } = useChangeWalletState(account, walletId)

  return (
    <Button variant={'danger'} disabled={isLoading} onClick={deleteWallet}>
      X
    </Button>
  )
}

const MoveUpButton = ({ walletId }: { walletId: string }) => {
  const account = useEdgeAccount()
  const sortWallets = useSortWallets(account)
  const activeWalletIds = useActiveWalletIds(account)

  const moveUp = () => {
    const currentIndex = activeWalletIds.indexOf(walletId)
    const newOrder = activeWalletIds.map((current, index, array) =>
      index === currentIndex - 1 ? walletId : index === currentIndex ? array[currentIndex - 1] : current,
    )

    sortWallets(newOrder)
  }

  return <Button onClick={moveUp}>↑</Button>
}

const MoveDownButton = ({ walletId }: { walletId: string }) => {
  const account = useEdgeAccount()
  const sortWallets = useSortWallets(account)
  const activeWalletIds = useActiveWalletIds(account)

  const moveDown = () => {
    const currentIndex = activeWalletIds.indexOf(walletId)
    const newOrder = activeWalletIds.map((current, index, array) =>
      index === currentIndex + 1 ? walletId : index === currentIndex ? array[currentIndex + 1] : current,
    )

    sortWallets(newOrder)
  }

  return <Button onClick={moveDown}>↓</Button>
}

const SplitWalletButtons = ({ walletId }: { walletId: string }) => {
  const account = useEdgeAccount()
  const { walletTypes, splitWallet } = useSplitWallet(account, walletId)

  return (
    <>
      {walletTypes.map((walletType: string) => (
        <Button key={walletType} variant={'warning'} onClick={() => splitWallet(walletType)}>
          S - {getCurrencyInfoFromWalletType(account, walletType).displayName}
        </Button>
      ))}
    </>
  )
}

export const getCurrencyInfoFromWalletType = (account: EdgeAccount, walletType: string) => {
  const currencyConfig = Object.values(account.currencyConfig).find(
    ({ currencyInfo }) => currencyInfo.walletType === walletType,
  )

  if (!currencyConfig) {
    throw new Error('Invalid Wallet Type')
  }

  return currencyConfig.currencyInfo
}
