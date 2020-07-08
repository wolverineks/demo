import { EdgeAccount } from 'edge-core-js'
import { useMutation, useQuery } from 'react-query'

import { optimisticMutationOptions } from '../hooks'

const queryKey = 'autoLogout'
const storeId = 'autoLogout'
const itemId = 'autoLogout.json'
const defaultAutoLogout = { enabled: true, delay: 3600 }

type AutoLogoutSetting = {
  enabled: boolean
  delay: number
}

export const useReadAutoLogout = ({ account }: { account: EdgeAccount }) =>
  useQuery({
    queryKey: queryKey,
    queryFn: () =>
      account.dataStore
        .getItem(storeId, itemId)
        .then(JSON.parse)
        .catch(() => defaultAutoLogout) as Promise<AutoLogoutSetting>,
    config: { suspense: true, cacheTime: 0, staleTime: Infinity },
  })

export const useWriteAutoLogout = ({ account }: { account: EdgeAccount }) =>
  useMutation(
    (autoLogout: AutoLogoutSetting) => account.dataStore.setItem(storeId, itemId, JSON.stringify(autoLogout)),
    optimisticMutationOptions<AutoLogoutSetting>(queryKey),
  )

export const useAutoLogout = ({ account }: { account: EdgeAccount }) =>
  [useReadAutoLogout({ account }).data!, useWriteAutoLogout({ account })[0]] as const
