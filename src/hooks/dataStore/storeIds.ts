import { EdgeDataStore } from 'edge-core-js'
import { QueryOptions, useQuery } from 'react-query'

interface StoreIdsQuery {
  dataStore: EdgeDataStore
}
const storeIdsQueryKey = () => ['dataStore'] as const
const storeIdsQueryFn = ({ dataStore }: StoreIdsQuery) => () => dataStore.listStoreIds()
const storeIdsQueryConfig = (config: QueryOptions<string[]>) => ({ cacheTime: 0, staleTime: Infinity, ...config })

export const useStoreIds = ({ dataStore }: StoreIdsQuery) =>
  useQuery({
    queryKey: storeIdsQueryKey(),
    queryFn: storeIdsQueryFn({ dataStore }),
    config: storeIdsQueryConfig({ suspense: true }),
  }).data!

export const usePrefetchStoreIds = ({ dataStore }: StoreIdsQuery) =>
  useQuery({
    queryKey: storeIdsQueryKey(),
    queryFn: storeIdsQueryFn({ dataStore }),
    config: storeIdsQueryConfig({ suspense: false, useErrorBoundary: false }),
  })
