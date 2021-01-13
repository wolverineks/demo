import { EdgeCurrencyWallet } from 'edge-core-js'
import React from 'react'
import { useQueryClient } from 'react-query'

import { useEdgeAccount } from '../auth'
import { useEdgeCurrencyWallet } from '../hooks'
import { getCurrencyCodeFromWalletId } from '../utils'

type SelectedWalletInfo = { id: string; currencyCode: string }
type SetSelectedWalletInfo = (selectedWalletInfo: SelectedWalletInfo) => void

const SelectedWalletInfoContext = React.createContext<
  Readonly<[SelectedWalletInfo | undefined, SetSelectedWalletInfo]> | undefined
>(undefined)

export const SelectedWalletInfoProvider: React.FC = ({ children }) => {
  const account = useEdgeAccount()
  const [selectedWalletId, setSelectedWalletId] = React.useState<string | undefined>(account.activeWalletIds[0])
  const [selectedCurrencyCode, setSelectedCurrencyCode] = React.useState<string | undefined>(
    selectedWalletId ? getCurrencyCodeFromWalletId(account, selectedWalletId) : undefined,
  )

  const setSelectedWalletInfo: SetSelectedWalletInfo = React.useCallback(({ id, currencyCode }) => {
    setSelectedWalletId(id)
    setSelectedCurrencyCode(currencyCode)
  }, [])

  // NO SELECTED WALLET / NO ACTIVE WALLET IDS
  let selectedWalletInfo: SelectedWalletInfo | undefined

  // SELECTED, ACTIVE
  if (selectedWalletId && selectedCurrencyCode && account.activeWalletIds.includes(selectedWalletId))
    selectedWalletInfo = { id: selectedWalletId, currencyCode: selectedCurrencyCode }

  const queryClient = useQueryClient()
  // if token is disabled while selected, clear
  React.useEffect(() => {
    if (!selectedWalletId || !selectedCurrencyCode) return

    const unsubscribe = queryClient.getQueryCache().subscribe(async (query) => {
      if (!query) return
      const match = query.queryKey[0] === selectedWalletId && query.queryKey[1] === 'enabledTokens'

      if (match) {
        const wallet = await account.waitForCurrencyWallet(selectedWalletId)
        const currencyInfo = wallet.currencyInfo
        const tokens = await wallet.getEnabledTokens()

        if (![...tokens, currencyInfo.currencyCode].includes(selectedCurrencyCode)) {
          setSelectedWalletId(undefined)
          setSelectedCurrencyCode(undefined)
        }
      }
    })

    return unsubscribe
  }, [account, queryClient, selectedCurrencyCode, selectedWalletId])

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

export const useSelectedWallet = (watch?: readonly (keyof EdgeCurrencyWallet)[]) => {
  const [walletInfo, selectWallet] = useSelectedWalletInfo()

  if (!walletInfo) throw new Error('Missing SelectedWallet Boundary')

  const wallet = useEdgeCurrencyWallet({ account: useEdgeAccount(), walletId: walletInfo.id as string, watch })

  return [{ wallet, id: walletInfo?.id, currencyCode: walletInfo?.currencyCode }, selectWallet] as const
}

export const SelectedWalletBoundary: React.FC<{ fallback?: React.ReactNode }> = ({ children, fallback = null }) => {
  const [walletInfo] = useSelectedWalletInfo()

  return <>{walletInfo ? children : fallback}</>
}
