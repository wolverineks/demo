import { EdgeDataStore } from 'edge-core-js'
import { useQuery } from 'react-query'

export const useStoreIds = ({ dataStore }: { dataStore: EdgeDataStore }) =>
  useQuery({
    queryKey: ['dataStore', 'storeIds'],
    queryFn: () => dataStore.listStoreIds(),
    config: { suspense: true, cacheTime: 0 },
  }).data!

export const useItemIds = ({ dataStore, storeId }: { dataStore: EdgeDataStore; storeId: string }) =>
  useQuery({
    queryKey: ['dataStore', storeId],
    queryFn: () => dataStore.listItemIds(storeId),
    config: { suspense: true, cacheTime: 0 },
  }).data!

export const useItem = ({
  dataStore,
  storeId,
  itemId,
}: {
  dataStore: EdgeDataStore
  storeId: string
  itemId: string
}) =>
  useQuery({
    queryKey: [storeId, itemId],
    queryFn: () => dataStore.getItem(storeId, itemId),
    config: { suspense: true, cacheTime: 0 },
  }).data!

export const usePrefetchStoreIds = ({ dataStore }: { dataStore: EdgeDataStore }) =>
  useQuery({
    queryKey: ['dataStore', 'storeIds'],
    queryFn: () => dataStore.listStoreIds(),
    config: { suspense: false, cacheTime: 0 },
  })

export const usePrefetchItemIds = ({ dataStore, storeId }: { dataStore: EdgeDataStore; storeId: string }) =>
  useQuery({
    queryKey: ['dataStore', storeId],
    queryFn: () => dataStore.listItemIds(storeId),
    config: { suspense: false, cacheTime: 0 },
  })

export const usePrefetchItem = ({
  dataStore,
  storeId,
  itemId,
}: {
  dataStore: EdgeDataStore
  storeId: string
  itemId: string
}) =>
  useQuery({
    queryKey: [storeId, itemId],
    queryFn: () => dataStore.getItem(storeId, itemId),
    config: { suspense: false, cacheTime: 0 },
  })
