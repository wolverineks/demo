import { EdgeCurrencyWallet } from 'edge-core-js'
import React from 'react'
import { FallbackProps } from 'react-error-boundary'

import { useAccount } from '../auth'
import { Boundary } from '../components'
import { useActiveWalletIds, useCurrencyWallets } from '../hooks'

const SelectedWalletIdContext = React.createContext<string>('')
const SelectWalletContext = React.createContext<(id: string) => undefined>(() => undefined)

export const SelectedWalletProvider: React.FC = ({ children }) => {
  const account = useAccount()
  const [selectedWalletId, setSelectedWalletId] = React.useState<string>(account.activeWalletIds[0])

  return (
    <SelectedWalletIdContext.Provider value={selectedWalletId}>
      <SelectWalletContext.Provider value={setSelectedWalletId as (id: string) => undefined}>
        {children}
      </SelectWalletContext.Provider>
    </SelectedWalletIdContext.Provider>
  )
}

export const SelectedWalletConsumer = ({ children }: { children: (wallet: EdgeCurrencyWallet) => any }) =>
  children(useSelectedWallet())

export class NoActiveWalletsError extends Error {}

export const useSelectWallet = () => React.useContext(SelectWalletContext)
export const useSelectedWallet = (options: { suspense: boolean } = { suspense: true }) => {
  const pending = React.useRef(false)
  const account = useAccount()
  useActiveWalletIds(account)
  useCurrencyWallets(account)

  // no active wallets
  // if (account.activeWalletIds.length <= 0 && options.suspense) throw new NoActiveWalletsError()

  const selectedWalletId = React.useContext(SelectedWalletIdContext)
  const fallbackWalletId = account.activeWalletIds[0]

  // archived or deleted ?
  const walletId = account.activeWalletIds.includes(selectedWalletId) ? selectedWalletId : fallbackWalletId
  const wallet = account.currencyWallets[walletId]

  const selectWallet = useSelectWallet()
  if (!account.activeWalletIds.includes(selectedWalletId)) selectWallet(fallbackWalletId)

  // loading
  if (account.activeWalletIds.includes(walletId) && !wallet) {
    if (!pending.current) {
      pending.current = true
      throw account.waitForCurrencyWallet(walletId)
    }
  }

  // loaded
  return wallet
}

export const SelectedWalletBoundary: React.FC = ({ children }) => (
  <Boundary error={{ fallbackRender }}>{children}</Boundary>
)

export const fallbackRender = ({ error }: FallbackProps) =>
  error instanceof NoActiveWalletsError ? <div>No Selected Wallet</div> : <div>Error: {error?.message}</div>
