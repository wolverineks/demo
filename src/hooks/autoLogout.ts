import { UseMutationOptions, UseQueryOptions, useMutation, useQuery } from 'react-query'

import { useEdgeAccount } from '../auth'
import { useInvalidateQueries } from '.'

export const defaultAutoLogout = { enabled: true, delay: 3600 }

type AutoLogoutSetting = {
  enabled: boolean
  delay: number
}

export const useReadAutoLogout = (queryConfig?: UseQueryOptions<AutoLogoutSetting>) => {
  const account = useEdgeAccount()

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

export const useWriteAutoLogout = (mutationOptions?: UseMutationOptions<void, unknown, AutoLogoutSetting>) => {
  const account = useEdgeAccount()
  const mutationFn = (autoLogout: AutoLogoutSetting) =>
    account.dataStore.setItem('autoLogout', 'autoLogout.json', JSON.stringify(autoLogout))

  return useMutation(mutationFn, {
    ...useInvalidateQueries([[account.username, 'autoLogout']]),
    ...mutationOptions,
  })
}

export const useAutoLogout = () => {
  return [useReadAutoLogout().data!, useWriteAutoLogout().mutate] as const
}
