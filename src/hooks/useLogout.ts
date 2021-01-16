import { useQueryClient } from 'react-query'

import { useEdgeAccount, useSetAccount } from '../auth'

export const useLogout = () => {
  const account = useEdgeAccount()
  const queryClient = useQueryClient()
  const setAccount = useSetAccount()

  return () => {
    setAccount(undefined)
    account.logout()
    queryClient.removeQueries({ predicate: ({ queryKey }) => queryKey[0] !== 'context' })
  }
}
