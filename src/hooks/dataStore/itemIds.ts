import { EdgeDataStore } from 'edge-core-js'
import React from 'react'
import { FetchQueryOptions, UseQueryOptions, useQuery, useQueryClient } from 'react-query'

interface ItemIdsQuery {
  dataStore: EdgeDataStore
  storeId: string
}

const queryFn = ({ dataStore, storeId }: ItemIdsQuery) => () => dataStore.listItemIds(storeId)

export const useItemIds = ({ dataStore, storeId }: ItemIdsQuery, options?: UseQueryOptions<string[]>) =>
  useQuery({
    queryKey: storeId,
    queryFn: queryFn({ dataStore, storeId }),
    suspense: true,
    cacheTime: Infinity,
    staleTime: Infinity,
    ...options,
  }).data!

export const usePrefetchItemIds = ({ dataStore, storeId }: ItemIdsQuery, options?: FetchQueryOptions) => {
  const queryClient = useQueryClient()

  React.useEffect(() => {
    queryClient.prefetchQuery(storeId, queryFn({ dataStore, storeId }), {
      cacheTime: Infinity,
      staleTime: Infinity,
      ...options,
    })
  }, [options, dataStore, queryClient, storeId])
}
