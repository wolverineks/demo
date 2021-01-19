import { EdgeAccount } from 'edge-core-js'
import { UseMutationOptions, UseQueryOptions, useMutation, useQuery } from 'react-query'

import { useInvalidateQueries } from '.'

export const defaultAutoLogout = { enabled: true, delay: 3600 }

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

  return useMutation(mutationFn, {
    ...useInvalidateQueries([[account.username, 'autoLogout']]),
    ...mutationOptions,
  })
}

export const useAutoLogout = (account: EdgeAccount) => {
  return [useReadAutoLogout(account).data!, useWriteAutoLogout(account).mutate] as const
}
