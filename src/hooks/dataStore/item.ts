import { EdgeDataStore } from 'edge-core-js'
import React from 'react'
import { FetchQueryOptions, QueryOptions, useQuery, useQueryClient } from 'react-query'

interface ItemQuery {
  dataStore: EdgeDataStore
  storeId: string
  itemId: string
}

const queryKey = ({ storeId, itemId }: { storeId: string; itemId: string }) => [storeId, itemId]
const queryFn = ({ dataStore, storeId, itemId }: ItemQuery) => () =>
  dataStore.getItem(storeId, itemId).then((data) => JSON.parse(data) as unknown)

export const useItem = ({ dataStore, storeId, itemId }: ItemQuery, options?: QueryOptions) =>
  useQuery(queryKey({ storeId, itemId }), queryFn({ dataStore, storeId, itemId }), {
    suspense: true,
    ...options,
  }).data!

export const usePrefetchItem = ({ dataStore, storeId, itemId }: ItemQuery, options?: FetchQueryOptions) => {
  const queryClient = useQueryClient()

  React.useEffect(() => {
    queryClient.prefetchQuery(queryKey({ storeId, itemId }), queryFn({ dataStore, storeId, itemId }), {
      ...options,
    })
  }, [options, dataStore, itemId, queryClient, storeId])
}
