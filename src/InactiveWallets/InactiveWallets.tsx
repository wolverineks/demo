import { EdgeCurrencyWallet } from 'edge-core-js'
import React from 'react'

import { useEdgeAccount } from '../auth'
import { useWriteInactiveWallet } from '../hooks'

export const InactiveWallets = () => {
  const account = useEdgeAccount()

  return (
    <>
      {Object.values(account.currencyWallets).map((wallet) => (
        <InactiveWallet key={wallet.id} wallet={wallet} />
      ))}
    </>
  )
}

const InactiveWallet: React.FC<{ wallet: EdgeCurrencyWallet }> = ({ wallet }) => {
  useWriteInactiveWallet(useEdgeAccount(), wallet)

  return null
}
