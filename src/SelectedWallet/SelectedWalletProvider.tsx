import { EdgeAccount, EdgeCurrencyWallet } from 'edge-core-js'
import React from 'react'

import { useEdgeAccount } from '../auth'
import { useEdgeCurrencyWallet } from '../hooks'

type SelectedWalletInfo = { id: string; currencyCode: string }
type SetSelectedWalletInfo = (selectedWalletInfo: SelectedWalletInfo) => void

const SelectedWalletInfoContext = React.createContext<
  Readonly<[SelectedWalletInfo | undefined, SetSelectedWalletInfo]> | undefined
>(undefined)

export const SelectedWalletInfoProvider: React.FC = ({ children }) => {
  const account = useEdgeAccount()
  const [id, setWalletId] = React.useState<string>(account.activeWalletIds[0])
  const [currencyCode, setCurrencyCode] = React.useState<string | undefined>(
    id ? getCurrencyCodeFromWalletId(account, id) : undefined,
  )

  const setSelectedWalletInfo: SetSelectedWalletInfo = React.useCallback(({ id, currencyCode }) => {
    setWalletId(id)
    setCurrencyCode(currencyCode)
  }, [])

  // NO SELECTED WALLET / NO ACTIVE WALLET IDS
  let selectedWalletInfo: SelectedWalletInfo | undefined

  // SELECTED, ACTIVE
  if (id && currencyCode && account.activeWalletIds.includes(id)) selectedWalletInfo = { id, currencyCode }

  // SELECTED WALLET DEACTIVATED + SWITCH TO NEXT WALLET
  if (!account.activeWalletIds.includes(id) && account.activeWalletIds.length > 0) {
    selectedWalletInfo = {
      id: account.activeWalletIds[0],
      currencyCode: getCurrencyCodeFromWalletId(account, account.activeWalletIds[0]),
    }

    setSelectedWalletInfo({
      id: account.activeWalletIds[0],
      currencyCode: getCurrencyCodeFromWalletId(account, account.activeWalletIds[0]),
    })
  }

  return (
    <SelectedWalletInfoContext.Provider value={[selectedWalletInfo, setSelectedWalletInfo] as const}>
      {children}
    </SelectedWalletInfoContext.Provider>
  )
}

const missingProvider = () => {
  throw new Error('missing provider')
}

export const useSelectedWalletInfoContext = () => React.useContext(SelectedWalletInfoContext) || missingProvider()

export const useSelectedWallet = (watch?: readonly (keyof EdgeCurrencyWallet)[]) => {
  const [walletInfo, selectWallet] = useSelectedWalletInfoContext()
  if (!walletInfo) throw new Error('Missing <SelectedWalletBoundary>')

  const wallet = useEdgeCurrencyWallet({ account: useEdgeAccount(), walletId: walletInfo.id, watch })

  return [{ wallet, ...walletInfo }, selectWallet] as const
}

const getCurrencyCodeFromWalletId = (account: EdgeAccount, id: string) => {
  const { allKeys, currencyConfig } = account
  const walletInfo = allKeys.find((walletInfo) => walletInfo.id === id)
  const currencyCode = Object.values(currencyConfig).find(
    ({ currencyInfo }) => currencyInfo.walletType === walletInfo?.type,
  )?.currencyInfo.currencyCode

  return currencyCode!
}

export const SelectedWalletBoundary: React.FC<{ fallback?: React.ReactNode }> = ({ children, fallback = null }) => {
  const [walletInfo] = useSelectedWalletInfoContext()

  return <>{walletInfo ? children : fallback}</>
}
