import { EdgeContext } from 'edge-core-js'
import { UseMutationOptions, UseQueryOptions, useMutation, useQuery, useQueryClient } from 'react-query'

import { useEdgeAccount } from '../auth'
import { useInvalidateQueries } from '.'

export const usePinExists = (context: EdgeContext, queryOptions?: UseQueryOptions<boolean>) => {
  const account = useEdgeAccount()
  const queryKey = [account.username, 'pinExists']
  const queryFn = async () => {
    const user = context.localUsers.find(({ username }) => username === account.username)

    return user?.pinLoginEnabled ?? false
  }

  return useQuery({
    queryKey,
    queryFn,
    ...queryOptions,
  })
}

export const usePinLoginEnabled = (context: EdgeContext, queryOptions?: UseQueryOptions<boolean>) => {
  const account = useEdgeAccount()
  const queryKey = [account.username, 'pinLoginEnabled']
  const queryFn = () => {
    const user = context.localUsers.find(({ username }) => username === account.username)

    return user?.pinLoginEnabled ?? false
  }

  return useQuery({
    queryKey,
    queryFn,
    ...queryOptions,
  })
}

export const useChangePinLogin = (mutationOptions?: UseMutationOptions<string, unknown, boolean>) => {
  const account = useEdgeAccount()
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

export const useChangePin = (mutationOptions?: UseMutationOptions<string, unknown, string>) => {
  const account = useEdgeAccount()

  return useMutation<string, unknown, string>((pin: string) => account.changePin({ pin }), {
    ...useInvalidateQueries([[account.username, 'pinExists']]),
    ...mutationOptions,
  })
}

export const useCheckPin = () => {
  const account = useEdgeAccount()

  return useMutation(account.checkPin)
}

export const useDeletePin = (mutationOptions?: UseMutationOptions<void>) => {
  const account = useEdgeAccount()

  return useMutation(account.deletePin, {
    ...useInvalidateQueries([
      [account.username, 'pinLoginEnabled'],
      [account.username, 'pinExists'],
    ]),
    ...mutationOptions,
  })
}

export const usePin = (context: EdgeContext) => {
  return {
    pinExists: usePinExists(context).data!,
    pinLoginEnabled: usePinLoginEnabled(context).data!,
    changePinLogin: useChangePinLogin(),
    changePin: useChangePin(),
    deletePin: useDeletePin(),
    checkPin: useCheckPin(),
  }
}
