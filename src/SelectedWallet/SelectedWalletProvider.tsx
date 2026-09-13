import { EdgeAccount } from 'edge-core-js'
import React from 'react'

import { useEdgeAccount } from '../auth'
import { useActiveWalletIds, useEdgeCurrencyWallet, useTokens } from '../hooks'

export const getCurrencyCodeFromWalletId = (account: EdgeAccount, id: string) => {
  const { allKeys, currencyConfig } = account
  const walletInfo = allKeys.find((walletInfo) => walletInfo.id === id)
  const currencyCode = Object.values(currencyConfig).find(
    ({ currencyInfo }) => currencyInfo.walletType === walletInfo?.type,
  )!.currencyInfo.currencyCode

  return currencyCode
}

export type SelectedWalletInfo = { id: string; currencyCode: string }
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

export const WalletInfoBoundary: React.FC<{ fallback?: React.ReactNode }> = ({ children, fallback = null }) => {
  const [walletInfo, selectWallet] = useSelectedWalletInfo()

  const account = useEdgeAccount()
  const activeWalletIds = useActiveWalletIds(account)

  // no wallet selected
  if (!walletInfo) return <>{fallback}</>

  // selected wallet deactivated remotely
  if (!activeWalletIds.includes(walletInfo.id)) {
    selectWallet(undefined)

    return <>{fallback}</>
  }

  return <>{children}</>
}

export const CurrencyCodeBoundary: React.FC<{ fallback?: React.ReactNode }> = ({ children, fallback = null }) => {
  const [walletInfo, selectWallet] = useSelectedWalletInfo()
  if (!walletInfo) throw new Error('Missing <WalletInfoBoundary>')

  const account = useEdgeAccount()
  const wallet = useEdgeCurrencyWallet({ account, walletId: walletInfo.id }) // never settles if archived id
  const tokens = useTokens(wallet)
  const nativeCurrencyCode = wallet.currencyInfo.currencyCode
  const isEnabled =
    walletInfo.currencyCode === nativeCurrencyCode || tokens.enabled.includes(walletInfo.currencyCode)

  // selected token deactivated: keep the wallet, fall back to the native coin
  if (!isEnabled) {
    selectWallet({ id: walletInfo.id, currencyCode: nativeCurrencyCode })

    return <>{fallback}</>
  }

  return <>{children}</>
}

export const SelectedWalletBoundary: React.FC<{ fallback?: React.ReactNode }> = ({ children, fallback = null }) => (
  <WalletInfoBoundary fallback={fallback}>
    <CurrencyCodeBoundary fallback={fallback}>{children}</CurrencyCodeBoundary>
  </WalletInfoBoundary>
)

export const useSelectedWallet = () => {
  const [walletInfo, selectWallet] = useSelectedWalletInfo()
  if (!walletInfo) throw new Error('Missing <SelectedWalletBoundary>')

  const account = useEdgeAccount()
  const wallet = useEdgeCurrencyWallet({ account, walletId: walletInfo.id }) // never settles if archived id

  return [{ wallet, id: walletInfo.id, currencyCode: walletInfo.currencyCode }, selectWallet] as const
}
