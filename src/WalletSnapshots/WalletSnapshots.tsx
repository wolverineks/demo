import { EdgeCurrencyWallet } from 'edge-core-js'
import React from 'react'

import { useEdgeAccount } from '../auth'
import { useCurrencyWallets, useWriteWalletSnapshot } from '../hooks'

export const WalletSnapshots = () => {
  const account = useEdgeAccount()
  const currencyWallets = useCurrencyWallets(account)

  return (
    <>
      {Object.values(currencyWallets).map((wallet) => (
        <WalletSnapshot key={wallet.id} wallet={wallet} />
      ))}
    </>
  )
}

const WalletSnapshot: React.FC<{ wallet: EdgeCurrencyWallet }> = ({ wallet }) => {
  const account = useEdgeAccount()
  useWriteWalletSnapshot(account, wallet)

  return null
}
