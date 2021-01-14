import { EdgeCurrencyWallet } from 'edge-core-js'
import React from 'react'

import { useEdgeAccount } from '../auth'
import { useWriteWalletSnapshot } from '../hooks'

export const WalletSnapshots = () => {
  const account = useEdgeAccount()

  return (
    <>
      {Object.values(account.currencyWallets).map((wallet) => (
        <WalletSnapshot key={wallet.id} wallet={wallet} />
      ))}
    </>
  )
}

const WalletSnapshot: React.FC<{ wallet: EdgeCurrencyWallet }> = ({ wallet }) => {
  useWriteWalletSnapshot(useEdgeAccount(), wallet)

  return null
}
