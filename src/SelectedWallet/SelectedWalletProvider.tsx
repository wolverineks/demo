import React from 'react'

import { useEdgeAccount } from '../auth'
import { useActiveWalletIds, useEdgeCurrencyWallet, useTokens } from '../hooks'
import { getCurrencyCodeFromWalletId } from '../utils'

type SelectedWalletInfo = { id: string; currencyCode: string }
type SetSelectedWalletInfo = (selectedWalletInfo?: SelectedWalletInfo) => void

const SelectedWalletInfoContext = React.createContext<
  Readonly<[SelectedWalletInfo | undefined, SetSelectedWalletInfo]> | undefined
>(undefined)

export const SelectedWalletInfoProvider: React.FC = ({ children }) => {
  const account = useEdgeAccount()
  const [selectedWalletInfo, setSelectedWalletInfo] = React.useState<SelectedWalletInfo | undefined>(
    account.activeWalletIds[0]
      ? {
          id: account.activeWalletIds[0],
          currencyCode: getCurrencyCodeFromWalletId(account, account.activeWalletIds[0]),
        }
      : undefined,
  )

  return (
    <SelectedWalletInfoContext.Provider value={[selectedWalletInfo, setSelectedWalletInfo] as const}>
      {children}
    </SelectedWalletInfoContext.Provider>
  )
}

const missingProvider = () => {
  throw new Error('missing provider')
}

export const useSelectedWalletInfo = () => React.useContext(SelectedWalletInfoContext) || missingProvider()

export const useSelectedWallet = () => {
  const [walletInfo, selectWallet] = useSelectedWalletInfo()

  if (!walletInfo) throw new Error('Missing SelectedWallet Boundary')

  const account = useEdgeAccount()
  const wallet = useEdgeCurrencyWallet({ account, walletId: walletInfo.id })

  // unselect wallet if edgeWallet is deactivated
  const activeWalletIds = useActiveWalletIds(account)
  if (!activeWalletIds.includes(walletInfo.id)) {
    selectWallet()
  }

  // unselect wallet if selected currency code is deactivated
  const { enabledTokens } = useTokens(account, wallet)
  if (![wallet.currencyInfo.currencyCode, ...enabledTokens].includes(walletInfo.currencyCode)) {
    selectWallet()
  }

  return [{ wallet, id: walletInfo?.id, currencyCode: walletInfo?.currencyCode }, selectWallet] as const
}

export const SelectedWalletBoundary: React.FC<{ fallback?: React.ReactNode }> = ({ children, fallback = null }) => {
  const [walletInfo] = useSelectedWalletInfo()

  return <>{walletInfo ? children : fallback}</>
}
