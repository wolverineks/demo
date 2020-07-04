import { EdgeAccount, EdgeCurrencyWallet } from 'edge-core-js'
import { useEdgeAccount } from 'edge-react-hooks'
import * as React from 'react'

const SelectedWalletContext = React.createContext<EdgeCurrencyWallet | undefined>(undefined)
const SelectWalletContext = React.createContext<(wallet: EdgeCurrencyWallet) => undefined>(() => undefined)

export const SelectedWalletProvider: React.FC = ({ children }) => {
  const [selectedWallet, setSelectedWallet] = React.useState<EdgeCurrencyWallet | undefined>()

  return (
    <SelectedWalletContext.Provider value={selectedWallet}>
      <SelectWalletContext.Provider value={setSelectedWallet as (wallet: EdgeCurrencyWallet) => undefined}>
        {children}
      </SelectWalletContext.Provider>
    </SelectedWalletContext.Provider>
  )
}

export const useSelectWallet = () => React.useContext(SelectWalletContext)
export const useSelectedWallet = ({ account }: { account: EdgeAccount }) => {
  useEdgeAccount(account)
  const selectedWallet = React.useContext(SelectedWalletContext)
  const selectWallet = useSelectWallet()
  const suspend = () => {
    throw account.waitForCurrencyWallet(account.activeWalletIds[0]).then(selectWallet)
  }

  const firstWalletId = account.activeWalletIds[0]
  const firstWallet = account.currencyWallets[firstWalletId]
  const loadingFirstWallet = account.activeWalletIds.length > 0 && !firstWallet

  const isDeactivated = (walletId: string) => !account.activeWalletIds.includes(walletId)

  // 111 do nothing
  if (selectedWallet && !isDeactivated(selectedWallet.id)) {
    return selectedWallet
  }

  // 100 initial
  if (loadingFirstWallet) {
    suspend()
  }

  // 001 deactivated select
  if (selectedWallet && isDeactivated(selectedWallet.id)) {
    selectWallet(firstWallet)

    return firstWallet
  }

  // 110 initial select
  if (!selectedWallet && !!firstWallet) {
    selectWallet(firstWallet)

    return firstWallet
  }

  return undefined
}
