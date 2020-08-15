import { EdgeAccount } from 'edge-core-js'
import React from 'react'

import { useWatchAll } from '../hooks'

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

export const useEdgeAccount = (watch?: readonly (keyof EdgeAccount)[]) => {
  const account = React.useContext(EdgeAccountContext) || unauthorized()
  useWatchAll(account, watch)

  return account
}
export const useSetAccount = () => React.useContext(SetEdgeAccountContext)

// const useLoginLogout = (context: EdgeContext) => {
//   const logout = () => {
//     const account = queryCache.getQueryData<EdgeAccount>('account')
//     account && account.logout()
//     queryCache.removeQueries('account', undefined)
//   }

//   const [
//     loginWithPassword,
//     loginWithPasswordState,
//   ] = useMutation(({ username, password, otp }: { username: string; password: string; otp?: string }) =>
//     context.loginWithPassword(username, password, { otp }),
//   )

//   const [
//     loginWithPin,
//     loginWithPinState,
//   ] = useMutation(({ username, pin, otp }: { username: string; pin: string; otp?: string }) =>
//     context.loginWithPIN(username, pin, { otp }),
//   )

//   const [
//     loginWithRecovery,
//     loginWithRecoveryState,
//   ] = useMutation(
//     ({
//       username,
//       recoveryKey,
//       answers,
//       otp,
//     }: {
//       username: string
//       recoveryKey: string
//       answers: string[]
//       otp?: string
//     }) => context.loginWithRecovery2(recoveryKey, username, answers, { otp }),
//   )

//   const [
//     loginWithKey,
//     loginWithKeyState,
//   ] = useMutation(({ username, loginKey, otp }: { username: string; loginKey: string; otp?: string }) =>
//     context.loginWithKey(username, loginKey, { otp }),
//   )

//   const [
//     createAccount,
//     createAccountState,
//   ] = useMutation(
//     ({ username, password, pin, otp }: { username: string; password: string; pin: string; otp?: string }) =>
//       context.createAccount(username, password, pin, { otp }),
//   )

//   return {
//     logout,
//     loginWithPassword,
//     loginWithPin,
//     loginWithRecovery,
//     loginWithKey,
//     createAccount,
//     status:
//       loginWithPasswordState.status ||
//       loginWithPinState.status ||
//       loginWithRecoveryState.status ||
//       loginWithKeyState.status ||
//       createAccountState.status,
//     error:
//       loginWithPasswordState.error ||
//       loginWithPinState.error ||
//       loginWithRecoveryState.error ||
//       loginWithKeyState.error ||
//       createAccountState.error,
//     reset: () => {
//       loginWithPasswordState.reset()
//       loginWithPinState.reset()
//       loginWithRecoveryState.reset()
//       loginWithKeyState.reset()
//       createAccountState.reset()
//     },
//   }
// }

// const AuthContext = React.createContext<ReturnType<typeof useLoginLogout>>(
//   (undefined as unknown) as ReturnType<typeof useLoginLogout>,
// )

// export const useAuth = () => React.useContext(AuthContext)

// export const AuthProvider: React.FC = ({ children }) => (
//   <AuthContext.Provider value={useLoginLogout(useEdgeContext())}>{children}</AuthContext.Provider>
// )
