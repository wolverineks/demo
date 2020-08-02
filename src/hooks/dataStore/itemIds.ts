import { EdgeDataStore } from 'edge-core-js'
import React from 'react'
import { QueryConfig, queryCache, useQuery } from 'react-query'

interface ItemIdsQuery {
  dataStore: EdgeDataStore
  storeId: string
}

const itemIdsQueryKey = ({ storeId }: { storeId: string }) => [storeId] as const
const itemIdsQueryFn = ({ dataStore, storeId }: ItemIdsQuery) => () => dataStore.listItemIds(storeId)
const itemIdsQueryConfig = (config: QueryConfig<string[]>) => ({ cacheTime: 0, staleTime: Infinity, ...config })

export const useItemIds = ({ dataStore, storeId }: ItemIdsQuery, config?: QueryConfig<string[]>) =>
  useQuery({
    queryKey: itemIdsQueryKey({ storeId }),
    queryFn: itemIdsQueryFn({ dataStore, storeId }),
    config: itemIdsQueryConfig({ suspense: true, ...config }),
  }).data!

export const usePrefetchItemIds = ({ dataStore, storeId }: ItemIdsQuery, config?: QueryConfig<string[]>) =>
  React.useEffect(() => {
    queryCache.prefetchQuery({
      queryKey: itemIdsQueryKey({ storeId }),
      queryFn: itemIdsQueryFn({ dataStore, storeId }),
      config: itemIdsQueryConfig({ suspense: false, useErrorBoundary: false, ...config }),
    })
  }, [config, dataStore, storeId])
