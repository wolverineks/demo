import { EdgeAccount } from 'edge-core-js'
import { queryCache, useMutation, useQuery } from 'react-query'

const queryKey = 'defaultFiatCurrencyCode'
const storeId = 'defaultFiatCurrencyCode'
const itemId = 'defaultFiatCurrencyCode.json'
const defaultFiatCurrencyCode = 'iso:USD'

const useReadDefaultFiatCurrencyCode = ({ account }: { account: EdgeAccount }) =>
  useQuery({
    queryKey,
    queryFn: () =>
      account.dataStore
        .getItem(storeId, itemId)
        .then(JSON.parse)
        .catch(() => defaultFiatCurrencyCode),
    config: { suspense: true },
  })

export const useWriteDefaultFiatCurrencyCode = ({ account }: { account: EdgeAccount }) =>
  useMutation(
    (currencyCode: string) =>
      account.dataStore.setItem(storeId, itemId, JSON.stringify(currencyCode)).catch(() => defaultFiatCurrencyCode),
    {
      onMutate: (currencyCode: string) => {
        queryCache.cancelQueries(queryKey)
        const previous = queryCache.getQueryData(queryKey)
        queryCache.setQueryData(queryKey, currencyCode)
        const rollback = () => queryCache.setQueryData(queryKey, previous)

        return rollback
      },
      onError: (_err, _attemptedValue, rollback) => rollback(),
      onSettled: () => queryCache.invalidateQueries(queryKey),
    },
  )

export const useDefaultFiatCurrencyCode = ({ account }: { account: EdgeAccount }) =>
  [useReadDefaultFiatCurrencyCode({ account }).data!, useWriteDefaultFiatCurrencyCode({ account })[0]] as const
