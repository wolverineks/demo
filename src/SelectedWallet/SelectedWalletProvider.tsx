import { EdgeTokenId } from 'edge-core-js'
import React from 'react'

import { useEdgeAccount } from '../auth'
import { useActiveWalletIds, useEdgeCurrencyWallet, useTokens } from '../hooks'

export type SelectedWalletInfo = { id: string; tokenId: EdgeTokenId }
type SetSelectedWalletInfo = (selectedWalletInfo?: SelectedWalletInfo) => void

const SelectedWalletInfoContext = React.createContext<
  Readonly<[SelectedWalletInfo | undefined, SetSelectedWalletInfo]> | undefined
>(undefined)

export const SelectedWalletInfoProvider: React.FC = ({ children }) => {
  const account = useEdgeAccount()
  const [selectedWalletInfo, setSelectedWalletInfo] = React.useState<SelectedWalletInfo | undefined>(
    account.activeWalletIds[0] ? { id: account.activeWalletIds[0], tokenId: null } : undefined,
  )
  const value = React.useMemo(() => [selectedWalletInfo, setSelectedWalletInfo] as const, [selectedWalletInfo])

  return <SelectedWalletInfoContext.Provider value={value}>{children}</SelectedWalletInfoContext.Provider>
}

const missingProvider = () => {
  throw new Error('missing provider')
}

export const useSelectedWalletInfo = () => React.useContext(SelectedWalletInfoContext) || missingProvider()

export const WalletInfoBoundary: React.FC<{ fallback?: React.ReactNode }> = ({ children, fallback = null }) => {
  const [walletInfo, selectWallet] = useSelectedWalletInfo()
  const activeWalletIds = useActiveWalletIds()

  if (!walletInfo) return <>{fallback}</>

  if (!activeWalletIds.includes(walletInfo.id)) {
    selectWallet(undefined)

    return <>{fallback}</>
  }

  return <>{children}</>
}

export const TokenIdBoundary: React.FC<{ fallback?: React.ReactNode }> = ({ children, fallback = null }) => {
  const [walletInfo, selectWallet] = useSelectedWalletInfo()
  if (!walletInfo) throw new Error('Missing <WalletInfoBoundary>')

  const wallet = useEdgeCurrencyWallet({ walletId: walletInfo.id })
  const tokens = useTokens(wallet)
  const isEnabled = walletInfo.tokenId == null || tokens.enabledTokenIds.includes(walletInfo.tokenId)

  if (!isEnabled) {
    selectWallet({ id: walletInfo.id, tokenId: null })

    return <>{fallback}</>
  }

  return <>{children}</>
}

export const SelectedWalletBoundary: React.FC<{ fallback?: React.ReactNode }> = ({ children, fallback = null }) => (
  <WalletInfoBoundary fallback={fallback}>
    <TokenIdBoundary fallback={fallback}>{children}</TokenIdBoundary>
  </WalletInfoBoundary>
)

export const useSelectedWallet = () => {
  const [walletInfo, selectWallet] = useSelectedWalletInfo()
  if (!walletInfo) throw new Error('Missing <SelectedWalletBoundary>')

  const wallet = useEdgeCurrencyWallet({ walletId: walletInfo.id })

  return [{ wallet, id: walletInfo.id, tokenId: walletInfo.tokenId }, selectWallet] as const
}
