import { EdgeDataStore } from 'edge-core-js'
import * as React from 'react'
import { Button, Card, ListGroup } from 'react-bootstrap'
import Json from 'react-json-pretty'
import { useQuery } from 'react-query'

const ToggleRow: React.FC<{
  title: string
  onDelete: () => any
  onOpen: () => any
}> = ({ children, title, onDelete, onOpen }) => {
  const [showContents, setShowContents] = React.useState(false)

  return (
    <div>
      <Button
        onClick={(event: any) => {
          event.stopPropagation()
          !showContents && onOpen()
          setShowContents((x) => !x)
        }}
      >
        {showContents ? '-' : '+'}
      </Button>
      {title}
      {
        <Button
          className={'float-right'}
          variant={'danger'}
          onClick={(event: React.MouseEvent) => {
            event.preventDefault()
            onDelete()
          }}
        >
          Delete
        </Button>
      }
      {showContents && children}
    </div>
  )
}

export const useStoreIds = ({ dataStore }: { dataStore: EdgeDataStore }) =>
  useQuery({
    queryKey: ['dataStore', 'storeIds'],
    queryFn: () => dataStore.listStoreIds(),
    config: { suspense: true, cacheTime: Infinity, staleTime: Infinity },
  }).data!

export const DataStore: React.FC<{
  dataStore: EdgeDataStore
  title: string
}> = ({ dataStore, title }) => {
  const storeIds = useStoreIds({ dataStore })

  return (
    <Card>
      <Card.Header>
        <Card.Title>{title}</Card.Title>
      </Card.Header>
      <Card.Body>
        <ListGroup>
          {storeIds.map((storeId) => (
            <ListGroup.Item key={storeId}>
              <Store dataStore={dataStore} storeId={storeId} />
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
  )
}

export const useItemIds = ({ dataStore, storeId }: { dataStore: EdgeDataStore; storeId: string }) =>
  useQuery({
    queryKey: ['dataStore', storeId],
    queryFn: () => dataStore.listItemIds(storeId),
    config: { suspense: true, cacheTime: Infinity, staleTime: Infinity },
  }).data!

export const Store: React.FC<{
  dataStore: EdgeDataStore
  storeId: string
}> = ({ dataStore, storeId }) => {
  // React.useEffect(() => {
  //   queryCache.prefetchQuery({
  //     queryKey: [storeId],
  //     queryFn: () => dataStore.listItemIds(storeId).catch(() => []),
  //   });
  // }, [dataStore, storeId]);

  return (
    <div style={{ paddingLeft: '20px' }}>
      <ToggleRow
        title={storeId}
        onOpen={() => {
          return
        }}
        onDelete={() => dataStore.deleteStore(storeId)}
      >
        <React.Suspense fallback={<div>Loading...</div>}>
          <StoreContents dataStore={dataStore} storeId={storeId} />
        </React.Suspense>
      </ToggleRow>
    </div>
  )
}

const StoreContents: React.FC<{
  dataStore: EdgeDataStore
  storeId: string
}> = ({ dataStore, storeId }) => {
  const itemIds = useItemIds({ dataStore, storeId })

  if (Object.entries(itemIds).length <= 0) {
    return (
      <ListGroup>
        <ListGroup.Item>Empty</ListGroup.Item>
      </ListGroup>
    )
  }

  return (
    <ListGroup>
      {itemIds.map((itemId) => (
        <ListGroup.Item key={itemId}>
          <Item dataStore={dataStore} storeId={storeId} itemId={itemId} />
        </ListGroup.Item>
      ))}
    </ListGroup>
  )
}

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
    queryKey: ['dataStore', storeId, itemId],
    queryFn: () => dataStore.getItem(storeId, itemId),
    config: { suspense: true, cacheTime: Infinity, staleTime: Infinity },
  }).data!

export const Item: React.FC<{
  dataStore: EdgeDataStore
  storeId: string
  itemId: string
}> = ({ dataStore, storeId, itemId }) => {
  // React.useEffect(() => {
  //   queryCache.prefetchQuery({
  //     queryKey: `${storeId} - ${itemId}`,
  //     queryFn: () => dataStore.getItem(storeId, itemId),
  //     config: { suspense: true, cacheTime: Infinity, staleTime: Infinity },
  //   });
  // }, [dataStore, storeId, itemId]);

  return (
    <div style={{ paddingLeft: '20px' }}>
      <ToggleRow
        title={itemId}
        onOpen={() => {
          return
        }}
        onDelete={() => dataStore.deleteItem(storeId, itemId)}
      >
        <React.Suspense fallback={<div>Loading...</div>}>
          <FileContents dataStore={dataStore} storeId={storeId} itemId={itemId} />
        </React.Suspense>
      </ToggleRow>
    </div>
  )
}

const FileContents: React.FC<{
  dataStore: EdgeDataStore
  storeId: string
  itemId: string
}> = ({ dataStore, storeId, itemId }) => {
  const item = useItem({ dataStore, storeId, itemId })

  return <Json data={item} />
}
