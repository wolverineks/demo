import { EdgeDataStore } from 'edge-core-js'
import { FetchQueryOptions, UseQueryOptions, useQuery, useQueryClient } from 'react-query'

interface ItemIdsQuery {
  dataStore: EdgeDataStore
  storeId: string
}

const queryFn = ({ dataStore, storeId }: ItemIdsQuery) => () => dataStore.listItemIds(storeId)

export const useItemIds = ({ dataStore, storeId }: ItemIdsQuery, options?: UseQueryOptions<string[]>) =>
  useQuery(storeId, queryFn({ dataStore, storeId }), {
    suspense: true,
    staleTime: 0,
    ...options,
  })

export const usePrefetchItemIds = ({ dataStore, storeId }: ItemIdsQuery, options?: FetchQueryOptions) => {
  const queryClient = useQueryClient()

  return () =>
    queryClient.prefetchQuery(storeId, queryFn({ dataStore, storeId }), {
      staleTime: 0,
      ...options,
    })
}
