import React from 'react'

import { Button } from '../../components'
import { useActiveWalletIds, useSortWallets } from '../../hooks'

export const WalletOptions = ({ walletId }: { walletId: string }) => {
  const activeWalletIds = useActiveWalletIds()

  const isTop = activeWalletIds[0] === walletId
  const isBottom = activeWalletIds[activeWalletIds.length - 1] === walletId

  return (
    <span className="wallet-actions">
      {!isTop ? <MoveUpButton walletId={walletId} /> : null}
      {!isBottom ? <MoveDownButton walletId={walletId} /> : null}
    </span>
  )
}

const MoveUpButton = ({ walletId }: { walletId: string }) => {
  const sortWallets = useSortWallets()
  const activeWalletIds = useActiveWalletIds()

  const moveUp = () => {
    const currentIndex = activeWalletIds.indexOf(walletId)
    const newOrder = activeWalletIds.map((current, index, array) =>
      index === currentIndex - 1 ? walletId : index === currentIndex ? array[currentIndex - 1] : current,
    )

    sortWallets(newOrder)
  }

  return (
    <Button size="sm" onClick={moveUp}>
      ↑
    </Button>
  )
}

const MoveDownButton = ({ walletId }: { walletId: string }) => {
  const sortWallets = useSortWallets()
  const activeWalletIds = useActiveWalletIds()

  const moveDown = () => {
    const currentIndex = activeWalletIds.indexOf(walletId)
    const newOrder = activeWalletIds.map((current, index, array) =>
      index === currentIndex + 1 ? walletId : index === currentIndex ? array[currentIndex + 1] : current,
    )

    sortWallets(newOrder)
  }

  return (
    <Button size="sm" onClick={moveDown}>
      ↓
    </Button>
  )
}
