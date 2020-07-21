import { EdgeCurrencyWallet } from 'edge-core-js'
import React from 'react'

import { useAccount } from '../auth'
import { useCurrencyWallets, useWriteInactiveWallet } from '../hooks'

export const InactiveWallets: React.FC = () => {
  const currencyWallets = useCurrencyWallets(useAccount())

  return (
    <>
      {Object.values(currencyWallets).map((wallet) => (
        <InactiveWallet key={wallet.id} wallet={wallet} />
      ))}
    </>
  )
}

const InactiveWallet: React.FC<{ wallet: EdgeCurrencyWallet }> = ({ wallet }) => {
  useWriteInactiveWallet(useAccount(), wallet)

  return null
}
