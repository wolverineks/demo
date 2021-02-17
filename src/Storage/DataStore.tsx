import { EdgeDataStore } from 'edge-core-js'
import React from 'react'
import { Button, Card, ListGroup } from 'react-bootstrap'
import Json from 'react-json-pretty'

import { Boundary } from '../components'
import { useItem, useItemIds, usePrefetchItem, usePrefetchItemIds, usePrefetchStoreIds, useStoreIds } from '../hooks'

export const DataStore: React.FC<{ dataStore: EdgeDataStore; title: string }> = ({ dataStore, title }) => {
  const prefetch = usePrefetchStoreIds({ dataStore })

  return (
    <Card>
      <Card.Header>
        <Card.Title>{title}</Card.Title>
      </Card.Header>
      <Card.Body>
        <div style={{ paddingLeft: '20px' }}>
          <ToggleRow onHover={prefetch} title={title}>
            <Boundary>
              <DataStoreContents dataStore={dataStore} />
            </Boundary>
          </ToggleRow>
        </div>
      </Card.Body>
    </Card>
  )
}

export const DataStoreContents: React.FC<{ dataStore: EdgeDataStore }> = ({ dataStore }) => {
  const { data: storeIds, refetch } = useStoreIds({ dataStore })

  return (
    <>
      {storeIds!.sort().map((storeId) => (
        <ListGroup.Item key={storeId}>
          <Store dataStore={dataStore} storeId={storeId} onDelete={refetch} />
        </ListGroup.Item>
      ))}
    </>
  )
}

export const Store: React.FC<{ dataStore: EdgeDataStore; storeId: string; onDelete: () => void }> = ({
  dataStore,
  storeId,
  onDelete,
}) => {
  const prefetch = usePrefetchItemIds({ dataStore, storeId })

  return (
    <div style={{ paddingLeft: '20px' }}>
      <ToggleRow title={storeId} onDelete={() => dataStore.deleteStore(storeId).then(onDelete)} onHover={prefetch}>
        <Boundary>
          <StoreContents dataStore={dataStore} storeId={storeId} />
        </Boundary>
      </ToggleRow>
    </div>
  )
}

const StoreContents: React.FC<{ dataStore: EdgeDataStore; storeId: string }> = ({ dataStore, storeId }) => {
  const { data: itemIds, refetch } = useItemIds({ dataStore, storeId })

  if (Object.entries(itemIds!).sort().length <= 0) {
    return (
      <ListGroup>
        <ListGroup.Item>Empty</ListGroup.Item>
      </ListGroup>
    )
  }

  return (
    <ListGroup>
      {itemIds!.map((itemId) => (
        <ListGroup.Item key={itemId}>
          <Item dataStore={dataStore} storeId={storeId} itemId={itemId} onDelete={refetch} />
        </ListGroup.Item>
      ))}
    </ListGroup>
  )
}

export const Item: React.FC<{
  dataStore: EdgeDataStore
  storeId: string
  itemId: string
  onDelete: () => void
}> = ({ dataStore, storeId, itemId, onDelete }) => {
  const prefetch = usePrefetchItem({ dataStore, storeId, itemId })

  return (
    <div style={{ paddingLeft: '20px' }}>
      <ToggleRow
        title={itemId}
        onDelete={() => dataStore.deleteItem(storeId, itemId).then(onDelete)}
        onHover={prefetch}
      >
        <React.Suspense fallback={<div>Loading...</div>}>
          <Boundary>
            <FileContents dataStore={dataStore} storeId={storeId} itemId={itemId} />
          </Boundary>
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

const ToggleRow: React.FC<{
  title: string
  onDelete?: () => any
  onHover: () => any
}> = ({ children, title, onDelete, onHover }) => {
  const [showContents, setShowContents] = React.useState(false)

  return (
    <div>
      <Button
        onMouseEnter={onHover}
        onClick={(event: any) => {
          event.stopPropagation()
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
            onDelete && onDelete()
          }}
        >
          Delete
        </Button>
      }
      {showContents && children}
    </div>
  )
}
