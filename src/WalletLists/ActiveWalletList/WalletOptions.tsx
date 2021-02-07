import React from 'react'
import { Button } from 'react-bootstrap'

import { useEdgeAccount } from '../../auth'
import { useActiveWalletIds, useChangeWalletState, useSortWallets } from '../../hooks'

export const WalletOptions = ({ walletId }: { walletId: string }) => {
  const account = useEdgeAccount()
  const { archiveWallet, deleteWallet, status } = useChangeWalletState(account, walletId)
  const sortWallets = useSortWallets(account)
  const activeWalletIds = useActiveWalletIds(account)

  const moveUp = () => {
    const currentIndex = activeWalletIds.indexOf(walletId)
    const newOrder = [...activeWalletIds].map((current, index, array) =>
      index === currentIndex - 1 ? walletId : index === currentIndex ? array[currentIndex - 1] : current,
    )

    sortWallets(newOrder)
  }

  const moveDown = () => {
    const currentIndex = activeWalletIds.indexOf(walletId)
    const newOrder = [...activeWalletIds].map((current, index, array) =>
      index === currentIndex + 1 ? walletId : index === currentIndex ? array[currentIndex + 1] : current,
    )

    sortWallets(newOrder)
  }

  const isTop = activeWalletIds[0] === walletId
  const isBottom = activeWalletIds[activeWalletIds.length - 1] === walletId

  return (
    <span className={'float-right'}>
      {!isTop ? (
        <Button disabled={status === 'loading'} onClick={moveUp}>
          ↑
        </Button>
      ) : null}
      {!isBottom ? (
        <Button disabled={status === 'loading'} onClick={moveDown}>
          ↓
        </Button>
      ) : null}
      <Button variant={'warning'} disabled={status === 'loading'} onClick={archiveWallet}>
        A
      </Button>
      <Button variant={'danger'} disabled={status === 'loading'} onClick={deleteWallet}>
        X
      </Button>
    </span>
  )
}
