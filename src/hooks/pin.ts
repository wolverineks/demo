import { EdgeAccount, EdgeContext } from 'edge-core-js'
import { UseMutationOptions, UseQueryOptions, useMutation, useQuery, useQueryClient } from 'react-query'

import { useInvalidateQueries } from '.'

export const usePinExists = (context: EdgeContext, account: EdgeAccount, queryOptions?: UseQueryOptions<boolean>) => {
  const queryKey = [account.username, 'pinExists']
  const queryFn = () => context.pinExists(account.username)

  return useQuery(queryKey, queryFn, { ...queryOptions })
}

export const usePinLoginEnabled = (
  context: EdgeContext,
  account: EdgeAccount,
  queryOptions?: UseQueryOptions<boolean>,
) => {
  const queryKey = [account.username, 'pinLoginEnabled']
  const queryFn = () => context.pinLoginEnabled(account.username)

  return useQuery(queryKey, queryFn, {
    ...queryOptions,
  })
}

export const useChangePinLogin = (
  account: EdgeAccount,
  mutationOptions?: UseMutationOptions<string, unknown, boolean>,
) => {
  const queryClient = useQueryClient()
  const queryKey = [account.username, 'pinLoginEnabled']
  const mutation = (enabled: boolean) => account.changePin({ enableLogin: enabled })

  return useMutation<string, unknown, boolean>(mutation, {
    onMutate: async () => {
      queryClient.cancelQueries(queryKey)
      queryClient.setQueryData(queryKey, (current) => !current)
    },
    onSettled: () => {
      queryClient.invalidateQueries(queryKey)
    },
    ...mutationOptions,
  })
}

export const useChangePin = (account: EdgeAccount, mutationOptions?: UseMutationOptions<string, unknown, string>) => {
  return useMutation<string, unknown, string>((pin: string) => account.changePin({ pin }), {
    ...useInvalidateQueries([[account.username, 'pinExists']]),
    ...mutationOptions,
  })
}

export const useCheckPin = (account: EdgeAccount) => {
  return useMutation(account.checkPin)
}

export const useDeletePin = (account: EdgeAccount, mutationOptions?: UseMutationOptions<void>) => {
  return useMutation(account.deletePin, {
    ...useInvalidateQueries([
      [account.username, 'pinLoginEnabled'],
      [account.username, 'pinExists'],
    ]),
    ...mutationOptions,
  })
}

export const usePin = (context: EdgeContext, account: EdgeAccount) => {
  return {
    pinExists: usePinExists(context, account).data!,
    pinLoginEnabled: usePinLoginEnabled(context, account).data!,
    changePinLogin: useChangePinLogin(account),
    changePin: useChangePin(account),
    deletePin: useDeletePin(account),
    checkPin: useCheckPin(account),
  }
}
