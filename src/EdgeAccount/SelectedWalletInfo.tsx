import React from 'react'

import { WalletInfo } from '../EdgeCurrencyWallet'
import { useSelectedWallet } from '../SelectedWallet'

export const SelectedWalletInfo = () => {
  const [selected] = useSelectedWallet()

  return <WalletInfo wallet={selected.wallet} currencyCode={selected.currencyCode} />
}
