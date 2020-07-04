import { EdgeAccount } from 'edge-core-js'
import { queryCache, useMutation, useQuery } from 'react-query'

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
        .catch(() => defaultAutoLogout),
    config: { suspense: true },
  })

export const useWriteAutoLogout = ({ account }: { account: EdgeAccount }) =>
  useMutation(
    (autoLogout: AutoLogoutSetting) =>
      account.dataStore.setItem(storeId, itemId, JSON.stringify(autoLogout)).catch(() => defaultAutoLogout),
    {
      onMutate: (autoLogout: AutoLogoutSetting) => {
        queryCache.cancelQueries(queryKey)
        const previous = queryCache.getQueryData(queryKey)
        queryCache.setQueryData(queryKey, autoLogout)
        const rollback = () => queryCache.setQueryData(queryKey, previous)

        return rollback
      },
      onError: (_err, _attemptedValue, rollback) => rollback(),
      onSettled: () => queryCache.invalidateQueries(queryKey),
    },
  )

export const useAutoLogout = ({ account }: { account: EdgeAccount }) =>
  [useReadAutoLogout({ account }).data!, useWriteAutoLogout({ account })[0]] as const
