import { EdgeAccount, EdgeCurrencyWallet } from 'edge-core-js'
import { useWatchAll } from 'edge-react-hooks'
import * as React from 'react'

import { useWriteLastKnownWalletState } from './useLastKnownWalletState'

export const LastKnownWalletStates: React.FC<{
  account: EdgeAccount
}> = ({ account }) => {
  useWatchAll(account)

  return (
    <>
      {Object.values(account.currencyWallets).map((wallet) => (
        <LastKnownWalletState key={wallet.id} account={account} wallet={wallet} />
      ))}
    </>
  )
}

const LastKnownWalletState: React.FC<{
  account: EdgeAccount
  wallet: EdgeCurrencyWallet
}> = ({ account, wallet }) => {
  useWriteLastKnownWalletState({ account, wallet })

  return null
}
