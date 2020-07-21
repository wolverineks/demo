import { EdgeDataStore } from 'edge-core-js'
import { QueryOptions, useQuery } from 'react-query'

interface ItemIdsQuery {
  dataStore: EdgeDataStore
  storeId: string
}

const itemIdsQueryKey = ({ storeId }: { storeId: string }) => [storeId] as const
const itemIdsQueryFn = ({ dataStore, storeId }: ItemIdsQuery) => () => dataStore.listItemIds(storeId)
const itemIdsQueryConfig = (config: QueryOptions<string[]>) => ({ cacheTime: 0, staleTime: Infinity, ...config })

export const useItemIds = ({ dataStore, storeId }: ItemIdsQuery) =>
  useQuery({
    queryKey: itemIdsQueryKey({ storeId }),
    queryFn: itemIdsQueryFn({ dataStore, storeId }),
    config: itemIdsQueryConfig({ suspense: true }),
  }).data!

export const usePrefetchItemIds = ({ dataStore, storeId }: ItemIdsQuery) =>
  useQuery({
    queryKey: itemIdsQueryKey({ storeId }),
    queryFn: itemIdsQueryFn({ dataStore, storeId }),
    config: itemIdsQueryConfig({ suspense: false, useErrorBoundary: false }),
  })
