import { EdgeAccount, EdgeCurrencyWallet } from 'edge-core-js'
import React from 'react'
import { queryCache } from 'react-query'

import { useEdgeAccount } from '../auth'
import { useEdgeCurrencyWallet } from '../hooks'
import { getInfo } from '../utils'

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

  // if token is disabled while selected, clear
  React.useEffect(() => {
    if (!selectedWalletId || !selectedCurrencyCode) return

    const enabledTokensQuery = queryCache.getQuery<string[]>([selectedWalletId, 'enabledTokens'])

    const queryInstance = enabledTokensQuery?.subscribe(({ data: tokens }) => {
      const currencyInfo = getInfo(account, getCurrencyCodeFromWalletId(account, selectedWalletId))
      if (!tokens) return

      if (![...tokens, currencyInfo.currencyCode].includes(selectedCurrencyCode)) {
        setSelectedWalletId(undefined)
        setSelectedCurrencyCode(undefined)
      }
    })

    return () => {
      queryInstance?.unsubscribe()
    }
  }, [account, selectedCurrencyCode, selectedWalletId])

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

const getCurrencyCodeFromWalletId = (account: EdgeAccount, id: string) => {
  const { allKeys, currencyConfig } = account
  const walletInfo = allKeys.find((walletInfo) => walletInfo.id === id)
  const currencyCode = Object.values(currencyConfig).find(
    ({ currencyInfo }) => currencyInfo.walletType === walletInfo?.type,
  )?.currencyInfo.currencyCode

  if (!currencyCode) throw new Error('Invalid wallet id')

  return currencyCode
}

export const SelectedWalletBoundary: React.FC<{ fallback?: React.ReactNode }> = ({ children, fallback = null }) => {
  const [walletInfo] = useSelectedWalletInfo()

  return <>{walletInfo ? children : fallback}</>
}

/* 

iterate over each wallet
subscribe to queryCache wallet enabled tokens

if wallet is selected, but token is disabled, clear state
*/
