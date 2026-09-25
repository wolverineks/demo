import { EdgeCurrencyWallet } from 'edge-core-js'
import React from 'react'

import { useCurrencyWallets, useWriteWalletSnapshot } from '../hooks'

export const WalletSnapshots = () => {
  const currencyWallets = useCurrencyWallets()

  return (
    <>
      {Object.values(currencyWallets).map((wallet) => (
        <WalletSnapshot key={wallet.id} wallet={wallet} />
      ))}
    </>
  )
}

const WalletSnapshot: React.FC<{ wallet: EdgeCurrencyWallet }> = ({ wallet }) => {
  useWriteWalletSnapshot(wallet)

  return null
}
