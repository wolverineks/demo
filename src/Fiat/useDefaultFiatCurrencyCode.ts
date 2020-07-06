import { EdgeAccount } from 'edge-core-js'
import { useMutation, useQuery } from 'react-query'

import { optimisticMutationOptions } from '../utils'

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
        .catch(() => defaultFiatCurrencyCode) as Promise<string>,
    config: { suspense: true },
  })

export const useWriteDefaultFiatCurrencyCode = ({ account }: { account: EdgeAccount }) =>
  useMutation(
    (currencyCode: string) => account.dataStore.setItem(storeId, itemId, JSON.stringify(currencyCode)),
    optimisticMutationOptions<string>(queryKey),
  )

export const useDefaultFiatCurrencyCode = ({ account }: { account: EdgeAccount }) =>
  [useReadDefaultFiatCurrencyCode({ account }).data!, useWriteDefaultFiatCurrencyCode({ account })[0]] as const
