import { EdgeAccount } from 'edge-core-js'
import React from 'react'

import { useAccount } from '../auth'
import { useActiveWalletIds, useWallet } from '../hooks'

type SelectedWalletInfo = { id: string; currencyCode: string }
type SetSelectedWalletInfo = (selectedWalletInfo: SelectedWalletInfo) => void

const SelectedWalletInfoContext = React.createContext<
  Readonly<[SelectedWalletInfo | undefined, SetSelectedWalletInfo]> | undefined
>(undefined)

export const SelectedWalletInfoProvider: React.FC = ({ children }) => {
  const account = useAccount()
  const activeWalletIds = useActiveWalletIds(account)
  const [id, setWalletId] = React.useState<string>('')
  const [currencyCode, setCurrencyCode] = React.useState<string>('')

  const setSelectedWalletInfo: SetSelectedWalletInfo = React.useCallback(({ id, currencyCode }) => {
    setWalletId(id)
    setCurrencyCode(currencyCode)
  }, [])

  // NO SELECTED WALLET / NO ACTIVE WALLET IDS
  let selectedWalletInfo: SelectedWalletInfo | undefined

  // SELECTED, ACTIVE
  if (activeWalletIds.includes(id)) selectedWalletInfo = { id, currencyCode }

  // SELECTED WALLET DEACTIVATED + SWITCH TO NEXT WALLET
  if (!activeWalletIds.includes(id) && activeWalletIds.length > 0) {
    selectedWalletInfo = {
      id: activeWalletIds[0],
      currencyCode: getCurrencyCodeFromWalletId(account, activeWalletIds[0]),
    }

    setSelectedWalletInfo({
      id: activeWalletIds[0],
      currencyCode: getCurrencyCodeFromWalletId(account, activeWalletIds[0]),
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

export const useSelectedWallet = () => {
  const [walletInfo, selectWallet] = useSelectedWalletInfoContext()
  if (!walletInfo) throw new Error('Missing <SelectedWalletBoundary>')

  const wallet = useWallet({ account: useAccount(), walletId: walletInfo.id })

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
