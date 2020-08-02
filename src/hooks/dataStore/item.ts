import { EdgeDataStore } from 'edge-core-js'
import React from 'react'
import { QueryConfig, queryCache, useQuery } from 'react-query'

interface ItemQuery {
  dataStore: EdgeDataStore
  storeId: string
  itemId: string
}

const itemQueryKey = ({ storeId, itemId }: { storeId: string; itemId: string }) => [storeId, itemId] as const
const itemQueryFn = ({ dataStore, storeId, itemId }: ItemQuery) => () =>
  dataStore.getItem(storeId, itemId).then((data) => JSON.parse(data) as unknown)
const itemQueryConfig = (config: QueryConfig<unknown>) => ({
  cacheTime: 0,
  staleTime: Infinity,
  ...config,
})

export const useItem = ({ dataStore, storeId, itemId }: ItemQuery, config?: QueryConfig<unknown>) =>
  useQuery({
    queryKey: itemQueryKey({ storeId, itemId }),
    queryFn: itemQueryFn({ dataStore, storeId, itemId }),
    config: itemQueryConfig({ suspense: true, ...config }),
  }).data!

export const usePrefetchItem = ({ dataStore, storeId, itemId }: ItemQuery, config?: QueryConfig<unknown>) =>
  React.useEffect(() => {
    queryCache.prefetchQuery({
      queryKey: itemQueryKey({ storeId, itemId }),
      queryFn: itemQueryFn({ dataStore, storeId, itemId }),
      config: itemQueryConfig({ suspense: false, useErrorBoundary: false, ...config }),
    })
  }, [config, dataStore, itemId, storeId])
