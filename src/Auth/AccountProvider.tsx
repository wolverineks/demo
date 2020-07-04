import { EdgeAccount } from 'edge-core-js'
import * as React from 'react'

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

export const useAccount = () => React.useContext(EdgeAccountContext)
export const useSetAccount = () => React.useContext(SetEdgeAccountContext)

// const useAuth = (context: EdgeContext) => {
//   const [account, setAccount] = React.useState<EdgeAccount>();
//   const [error, setError] = React.useState<Error>();
//   const pendingRef = React.useRef(false);

//   const logout = () => {
//     setAccount(undefined);
//     account && account.logout();
//   };

//   return {
//     account,
//     error,
//     pending: () => pendingRef.current,
//     logout,
//     loginWithPassword: ({ username, password }) => {
//       if (pendingRef.current) return;
//       pendingRef.current = true;
//       return context
//         .loginWithPassword(username, password)
//         .then(setAccount)
//         .catch(setError)
//         .finally(() => (pendingRef.current = false));
//     },
//     loginWithPin: ({ username, pin, otp }) => {
//       if (pendingRef.current) return;
//       pendingRef.current = true;
//       return context
//         .loginWithPassword(username, pin, { otp })
//         .then(setAccount)
//         .catch(setError)
//         .finally(() => (pendingRef.current = false));
//     },
//     loginWithRecovery: ({ username, key, answers, otp }) => {
//       if (pendingRef.current) return;
//       pendingRef.current = true;
//       return context
//         .loginWithRecovery2(key, username, answers, { otp })
//         .then(setAccount)
//         .catch(setError)
//         .finally(() => (pendingRef.current = false));
//     },
//     loginWithKey: ({ username, key, otp }) => {
//       if (pendingRef.current) return;
//       pendingRef.current = true;
//       return context
//         .loginWithKey(username, key, { otp })
//         .then(setAccount)
//         .catch(setError)
//         .finally(() => (pendingRef.current = false));
//     },
//   };
// };

// const AuthContext = React.createContext<ReturnType<typeof useAuth>>(
//   (undefined as unknown) as ReturnType<typeof useAuth>,
// );

// const useLoginWithPassword = () => useAuthContext().loginWithPassword;
// const usePending = () => useAuthContext().pending;
// const useError = () => useAuthContext().error;
// const useAuthContext = () => React.useContext(AuthContext);

// const AuthProvider: React.FC<{ context: EdgeContext }> = ({
//   context,
//   children,
// }) => (
//   <AuthContext.Provider value={useAuth(context)}>
//     {children}
//   </AuthContext.Provider>
// );

// export const App: React.FC<{ context: EdgeContext }> = ({ context }) => {
//   return (
//     <AuthProvider context={context}>
//       <Login />
//     </AuthProvider>
//   );
// };

// const Login: React.FC = () => {
//   const [username, setUsername] = React.useState("");
//   const [password, setPassword] = React.useState("");
//   const loginWithPassword = useLoginWithPassword();
//   const error = useError();
//   const pending = usePending();

//   return (
//     <div>
//       {error && <span>{error.message}</span>}
//       <button
//         disabled={pending()}
//         onClick={() =>
//           loginWithPassword({ username, password }).then(() =>
//             console.log("LOGGED IN"),
//           )
//         }
//       >
//         login
//       </button>
//     </div>
//   );
// };
