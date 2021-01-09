import { EdgeDataStore } from 'edge-core-js'
import React from 'react'
import { FetchQueryOptions, UseQueryOptions, useQuery, useQueryClient } from 'react-query'

interface StoreIdsQuery {
  dataStore: EdgeDataStore
}
const queryKey = 'dataStore'
const queryFn = ({ dataStore }: StoreIdsQuery) => () => dataStore.listStoreIds()

export const useStoreIds = ({ dataStore }: StoreIdsQuery, options?: UseQueryOptions) =>
  useQuery(queryKey, queryFn({ dataStore }), {
    suspense: true,
    cacheTime: Infinity,
    staleTime: Infinity,
  }).data!

export const usePrefetchStoreIds = ({ dataStore }: StoreIdsQuery, options?: FetchQueryOptions) => {
  const queryClient = useQueryClient()

  React.useEffect(() => {
    queryClient.prefetchQuery(queryKey, queryFn({ dataStore }), {
      cacheTime: Infinity,
      staleTime: Infinity,
      ...options,
    })
  }, [options, dataStore, queryClient])
}
