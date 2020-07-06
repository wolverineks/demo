import { EdgeCurrencyWallet } from 'edge-core-js'
import * as React from 'react'

import { useAccount } from '../../Auth'
import { useWriteLastKnownWalletState } from './useLastKnownWalletState'

export const LastKnownWalletStates: React.FC = () => {
  const account = useAccount()

  return (
    <>
      {Object.values(account.currencyWallets).map((wallet) => (
        <LastKnownWalletState key={wallet.id} wallet={wallet} />
      ))}
    </>
  )
}

const LastKnownWalletState: React.FC<{
  wallet: EdgeCurrencyWallet
}> = ({ wallet }) => {
  const account = useAccount()
  useWriteLastKnownWalletState({ account, wallet })

  return null
}
