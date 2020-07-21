import { EdgeDataStore } from 'edge-core-js'
import { QueryOptions, useQuery } from 'react-query'

interface ItemQuery {
  dataStore: EdgeDataStore
  storeId: string
  itemId: string
}

const itemQueryKey = ({ storeId, itemId }: { storeId: string; itemId: string }) => [storeId, itemId] as const
const itemQueryFn = ({ dataStore, storeId, itemId }: ItemQuery) => () =>
  dataStore.getItem(storeId, itemId).then(JSON.parse)
const itemQueryConfig = (config: QueryOptions<any>) => ({
  cacheTime: 0,
  staleTime: Infinity,
  ...config,
})

export const useItem = ({ dataStore, storeId, itemId }: ItemQuery) =>
  useQuery({
    queryKey: itemQueryKey({ storeId, itemId }),
    queryFn: itemQueryFn({ dataStore, storeId, itemId }),
    config: itemQueryConfig({ suspense: true }),
  }).data!

export const usePrefetchItem = ({ dataStore, storeId, itemId }: ItemQuery) =>
  useQuery({
    queryKey: itemQueryKey({ storeId, itemId }),
    queryFn: itemQueryFn({ dataStore, storeId, itemId }),
    config: itemQueryConfig({ suspense: false, useErrorBoundary: false }),
  })
