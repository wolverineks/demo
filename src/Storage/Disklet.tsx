import { Disklet as DiskletType } from 'disklet'
import React from 'react'
import { Button, Card, ListGroup } from 'react-bootstrap'
import Json from 'react-json-pretty'

import { Boundary } from '../components'
import { useFile, useFolder, usePrefetchFile, usePrefetchFolder } from '../hooks'

export const fileName = (path: string) => (path.match(/\w*.\w+$/) || [])[0] || '/'
export const folderName = (path: string) => (path.match(/\w+$/) || [])[0] || '/'

export const Disklet: React.FC<{
  disklet: DiskletType
  path?: string
  title: string
  id: string | string[]
}> = ({ disklet, path = '/', title, id }) => {
  return (
    <Card>
      <Card.Header>
        <Card.Title>{title}</Card.Title>
      </Card.Header>
      <Card.Body>
        <Folder disklet={disklet} path={path} id={id} />
      </Card.Body>
    </Card>
  )
}

export const Folder: React.FC<{
  disklet: DiskletType
  path: string
  id: string | string[]
  onDelete?: () => any
}> = ({ disklet, path = '/', id, onDelete = () => null }) => {
  const queryKey = Array.isArray(id) ? [...id, path] : [id, path]
  const prefetch = usePrefetchFolder({ disklet, path, queryKey })

  return (
    <div style={{ paddingLeft: '20px' }}>
      <ToggleRow title={folderName(path)} onDelete={() => disklet.delete(path).then(onDelete)} onHover={prefetch}>
        <Boundary>
          <FolderContents disklet={disklet} path={path} id={id} />
        </Boundary>
      </ToggleRow>
    </div>
  )
}

const FolderContents: React.FC<{ disklet: DiskletType; path: string; id: string | string[] }> = ({
  disklet,
  path,
  id,
}) => {
  const folder = useFolder({ disklet, path, queryKey: Array.isArray(id) ? [...id, path] : [id, path] })

  if (Object.entries(folder.data!).length <= 0) {
    return (
      <ListGroup>
        <ListGroup.Item>Empty</ListGroup.Item>
      </ListGroup>
    )
  }

  return (
    <ListGroup>
      {Object.entries(folder.data!).map(([key, value]) =>
        value === 'folder' ? (
          <ListGroup.Item key={key}>
            <Folder id={id} disklet={disklet} path={key} onDelete={folder.refetch} />
          </ListGroup.Item>
        ) : value === 'file' ? (
          <ListGroup.Item key={key}>
            <File disklet={disklet} path={key} id={id} onDelete={folder.refetch} />
          </ListGroup.Item>
        ) : null,
      )}
    </ListGroup>
  )
}

export const File: React.FC<{ disklet: DiskletType; path: string; id: string | string[]; onDelete: () => any }> = ({
  disklet,
  path,
  id,
  onDelete,
}) => {
  const queryKey = React.useMemo(() => (Array.isArray(id) ? [...id, path] : [id, path]), [id, path])
  const prefetch = usePrefetchFile({ disklet, path, queryKey })

  return (
    <div style={{ paddingLeft: '20px' }}>
      <ToggleRow title={fileName(path)} onDelete={() => disklet.delete(path).then(onDelete)} onHover={prefetch}>
        <Boundary>
          <FileContents disklet={disklet} path={path} id={id} />
        </Boundary>
      </ToggleRow>
    </div>
  )
}

const FileContents: React.FC<{ disklet: DiskletType; path: string; id: string | string[] }> = ({
  disklet,
  path,
  id,
}) => {
  const queryKey = React.useMemo(() => (Array.isArray(id) ? [...id, path] : [id, path]), [id, path])
  const file = useFile<Record<string, any>>({ disklet, path, queryKey })

  return <Json data={file.data} />
}

const ToggleRow: React.FC<{
  title: string
  onDelete: () => any
  onOpen?: () => any
  onHover?: () => any
}> = ({ children, title, onDelete, onOpen, onHover }) => {
  const [showContents, setShowContents] = React.useState(false)

  return (
    <div>
      <Button
        onMouseEnter={onHover}
        onClick={(event: any) => {
          event.stopPropagation()
          !showContents && onOpen && onOpen()
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
      {showContents ? children : null}
    </div>
  )
}
