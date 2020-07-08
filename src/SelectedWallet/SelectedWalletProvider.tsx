import * as React from 'react'
import { FallbackProps } from 'react-error-boundary'

import { useAccount } from '../auth'
import { useWatchAll } from '../hooks'

const SelectedWalletIdContext = React.createContext<string>('')
const SelectWalletContext = React.createContext<(id: string) => undefined>(() => undefined)

export const SelectedWalletProvider: React.FC = ({ children }) => {
  const account = useAccount()
  const [selectedWalletId, setSelectedWalletId] = React.useState<string>(account.activeWalletIds[0])

  console.log('qwe', 'SelectedWalletProvider')

  return (
    <SelectedWalletIdContext.Provider value={selectedWalletId}>
      <SelectWalletContext.Provider value={setSelectedWalletId as (id: string) => undefined}>
        {children}
      </SelectWalletContext.Provider>
    </SelectedWalletIdContext.Provider>
  )
}

export class NoActiveWalletsError extends Error {}

export const useSelectWallet = () => React.useContext(SelectWalletContext)
export const useSelectedWallet = () => {
  const pending = React.useRef(false)
  const account = useAccount()
  if (account.activeWalletIds.length <= 0) throw new NoActiveWalletsError()

  const selectWallet = useSelectWallet()

  const selectedWalletId = React.useContext(SelectedWalletIdContext)
  const fallbackWalletId = account.activeWalletIds[0]

  const walletId = account.activeWalletIds.includes(selectedWalletId) ? selectedWalletId : fallbackWalletId
  const wallet = account.currencyWallets[walletId]

  // if (!account.activeWalletIds.includes(selectedWalletId)) selectWallet(fallbackWalletId)

  // loading
  if (account.activeWalletIds.includes(walletId) && !wallet) {
    if (!pending.current) {
      pending.current = true
      throw account.waitForCurrencyWallet(walletId)
    }
  }

  useWatchAll(wallet as any)

  // loaded
  return wallet
}

export const fallbackRender = ({ error }: FallbackProps) =>
  error instanceof NoActiveWalletsError ? <div>No Selected Wallet</div> : <div>Error: {error?.message}</div>
