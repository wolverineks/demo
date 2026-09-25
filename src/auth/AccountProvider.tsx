import { EdgeAccount } from 'edge-core-js'
import React from 'react'

export const EdgeAccountContext = React.createContext<EdgeAccount | undefined>(undefined)
export const SetEdgeAccountContext = React.createContext<(account?: EdgeAccount) => void>(() => undefined)

export const AccountProvider: React.FC = ({ children }) => {
  const [account, setAccount] = React.useState<EdgeAccount | undefined>(undefined)

  return (
    <EdgeAccountContext.Provider value={account}>
      <SetEdgeAccountContext.Provider value={setAccount}>{children}</SetEdgeAccountContext.Provider>
    </EdgeAccountContext.Provider>
  )
}

export const AccountConsumer = EdgeAccountContext.Consumer

const unauthorized = () => {
  throw new Error('Unauthorized')
}

export const useEdgeAccount = () => {
  const account = React.useContext(EdgeAccountContext) || unauthorized()

  return account
}

export const useSetAccount = () => React.useContext(SetEdgeAccountContext)
