import { EdgeDataStore } from 'edge-core-js'
import { FetchQueryOptions, UseQueryOptions, useQuery, useQueryClient } from 'react-query'

interface StoreIdsQuery {
  dataStore: EdgeDataStore
}
const queryKey = 'dataStore'
const queryFn = ({ dataStore }: StoreIdsQuery) => () => dataStore.listStoreIds()

export const useStoreIds = ({ dataStore }: StoreIdsQuery, queryOptions?: UseQueryOptions<string[]>) =>
  useQuery(queryKey, queryFn({ dataStore }), {
    suspense: true,
    staleTime: 0,
    ...queryOptions,
  })

export const usePrefetchStoreIds = ({ dataStore }: StoreIdsQuery, queryOptions?: FetchQueryOptions) => {
  const queryClient = useQueryClient()

  return () =>
    queryClient.prefetchQuery(queryKey, queryFn({ dataStore }), {
      staleTime: 0,
      ...queryOptions,
    })
}
