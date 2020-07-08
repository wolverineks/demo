import { EdgeDataStore } from 'edge-core-js'
import * as React from 'react'
import { Button, Card, ListGroup } from 'react-bootstrap'
import Json from 'react-json-pretty'

import { Boundary } from '../components'
import { useItem, useItemIds, usePrefetchItem, usePrefetchItemIds, usePrefetchStoreIds, useStoreIds } from '../hooks'

export const DataStore: React.FC<{
  dataStore: EdgeDataStore
  title: string
}> = ({ dataStore, title }) => {
  usePrefetchStoreIds({ dataStore })

  return (
    <Card>
      <Card.Header>
        <Card.Title>{title}</Card.Title>
      </Card.Header>
      <Card.Body>
        <div style={{ paddingLeft: '20px' }}>
          <ToggleRow
            title={title}
            onDelete={() => {
              return
            }}
            onOpen={() => {
              return
            }}
          >
            <Boundary>
              <DataStoreContents dataStore={dataStore} />
            </Boundary>
          </ToggleRow>
        </div>
      </Card.Body>
    </Card>
  )
}

export const DataStoreContents: React.FC<{
  dataStore: EdgeDataStore
}> = ({ dataStore }) => {
  const storeIds = useStoreIds({ dataStore })

  return (
    <>
      {storeIds.map((storeId) => (
        <ListGroup.Item key={storeId}>
          <Store dataStore={dataStore} storeId={storeId} />
        </ListGroup.Item>
      ))}
    </>
  )
}

export const Store: React.FC<{
  dataStore: EdgeDataStore
  storeId: string
}> = ({ dataStore, storeId }) => {
  usePrefetchItemIds({ dataStore, storeId })

  return (
    <div style={{ paddingLeft: '20px' }}>
      <ToggleRow
        title={storeId}
        onOpen={() => {
          return
        }}
        onDelete={() => dataStore.deleteStore(storeId)}
      >
        <Boundary>
          <StoreContents dataStore={dataStore} storeId={storeId} />
        </Boundary>
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

export const Item: React.FC<{
  dataStore: EdgeDataStore
  storeId: string
  itemId: string
}> = ({ dataStore, storeId, itemId }) => {
  usePrefetchItem({ dataStore, storeId, itemId })

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
