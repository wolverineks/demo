import { EdgeAccount } from 'edge-core-js'
import { UseMutationOptions, useMutation } from 'react-query'

export const useChangePassword = (account: EdgeAccount, mutationOptions?: UseMutationOptions<void, Error, string>) => {
  return useMutation(account.changePassword, { ...mutationOptions })
}

export const useCheckPassword = (
  account: EdgeAccount,
  mutationOptions?: UseMutationOptions<boolean, Error, string>,
) => {
  return useMutation(account.checkPassword, { ...mutationOptions })
}

export const useDeletePassword = (account: EdgeAccount, mutationOptions?: UseMutationOptions<void>) => {
  return useMutation(account.deletePassword, { ...mutationOptions })
}

export const usePassword = (account: EdgeAccount) => {
  return {
    changePassword: useChangePassword(account),
    deletePassword: useDeletePassword(account),
    checkPassword: useCheckPassword(account),
  }
}
