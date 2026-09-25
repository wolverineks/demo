import { UseMutationOptions, useMutation } from 'react-query'

import { useEdgeAccount } from '../auth'

export const useChangePassword = (mutationOptions?: UseMutationOptions<void, Error, string>) => {
  const account = useEdgeAccount()

  return useMutation(account.changePassword, { ...mutationOptions })
}

export const useCheckPassword = (mutationOptions?: UseMutationOptions<boolean, Error, string>) => {
  const account = useEdgeAccount()

  return useMutation(account.checkPassword, { ...mutationOptions })
}

export const useDeletePassword = (mutationOptions?: UseMutationOptions<void>) => {
  const account = useEdgeAccount()

  return useMutation(account.deletePassword, { ...mutationOptions })
}

export const usePassword = () => {
  return {
    changePassword: useChangePassword(),
    deletePassword: useDeletePassword(),
    checkPassword: useCheckPassword(),
  }
}
