import { EdgeAccount } from 'edge-core-js'
import { UseMutationOptions, UseQueryOptions, useMutation, useQuery, useQueryClient } from 'react-query'

const defaultAutoLogout = { enabled: true, delay: 3600 }

type AutoLogoutSetting = {
  enabled: boolean
  delay: number
}

export const useReadAutoLogout = (account: EdgeAccount, queryConfig?: UseQueryOptions<AutoLogoutSetting>) => {
  return useQuery({
    queryKey: [account.username, 'autoLogout'],
    queryFn: () =>
      account.dataStore
        .getItem('autoLogout', 'autoLogout.json')
        .then(JSON.parse)
        .catch(() => defaultAutoLogout) as Promise<AutoLogoutSetting>,
    ...queryConfig,
  })
}

export const useWriteAutoLogout = (
  account: EdgeAccount,
  mutationOptions?: UseMutationOptions<void, unknown, AutoLogoutSetting>,
) => {
  const mutationFn = (autoLogout: AutoLogoutSetting) =>
    account.dataStore.setItem('autoLogout', 'autoLogout.json', JSON.stringify(autoLogout))
  const queryClient = useQueryClient()
  const queryKey = [account.username, 'autoLogout']

  return useMutation(mutationFn, {
    onMutate: () => {
      queryClient.cancelQueries(queryKey)
      queryClient.cancelQueries(['autoLogout', 'autoLogout.json']) // invalidate datastore
    },
    onSettled: () => {
      queryClient.invalidateQueries(queryKey)
      queryClient.invalidateQueries(['autoLogout', 'autoLogout.json']) // invalidate datastore
    },
    ...mutationOptions,
  })
}

export const useAutoLogout = (account: EdgeAccount) => {
  return [useReadAutoLogout(account).data!, useWriteAutoLogout(account).mutate] as const
}
