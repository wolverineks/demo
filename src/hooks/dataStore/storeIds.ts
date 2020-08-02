import { EdgeDataStore } from 'edge-core-js'
import React from 'react'
import { QueryConfig, queryCache, useQuery } from 'react-query'

interface StoreIdsQuery {
  dataStore: EdgeDataStore
}
const storeIdsQueryKey = () => ['dataStore'] as const
const storeIdsQueryFn = ({ dataStore }: StoreIdsQuery) => () => dataStore.listStoreIds()
const storeIdsQueryConfig = (config?: QueryConfig<string[]>) => ({ cacheTime: 0, staleTime: Infinity, ...config })

export const useStoreIds = ({ dataStore }: StoreIdsQuery, config?: QueryConfig<string[]>) =>
  useQuery({
    queryKey: storeIdsQueryKey(),
    queryFn: storeIdsQueryFn({ dataStore }),
    config: storeIdsQueryConfig({ suspense: true, ...config }),
  }).data!

export const usePrefetchStoreIds = ({ dataStore }: StoreIdsQuery, config?: QueryConfig<string[]>) =>
  React.useEffect(() => {
    queryCache.prefetchQuery({
      queryKey: storeIdsQueryKey(),
      queryFn: storeIdsQueryFn({ dataStore }),
      config: storeIdsQueryConfig(config),
    })
  }, [config, dataStore])
