import { DiskletListing, Disklet as DiskletType } from 'disklet'
import { useFile, useFolder } from 'edge-react-hooks'
import * as React from 'react'
import { Button, Card, ListGroup } from 'react-bootstrap'
import Json from 'react-json-pretty'

export const fileName = (path: string) => (path.match(/\w*.\w+$/) || [])[0] || '/'
export const folderName = (path: string) => (path.match(/\w+$/) || [])[0] || '/'

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

export const Disklet: React.FC<{
  disklet: DiskletType
  path?: string
  title: string
}> = ({ disklet, path = '/', title }) => {
  return (
    <Card>
      <Card.Header>
        <Card.Title>{title}</Card.Title>
      </Card.Header>
      <Card.Body>
        <Folder disklet={disklet} path={path} />
      </Card.Body>
    </Card>
  )
}

export const Folder: React.FC<{ disklet: DiskletType; path: string }> = ({ disklet, path = '/' }) => {
  const folder = useFolder(disklet, { path })

  return (
    <div style={{ paddingLeft: '20px' }}>
      <ToggleRow title={folderName(path)} onOpen={folder.execute} onDelete={() => disklet.delete(path)}>
        {folder.data ? <FolderContents disklet={disklet} folder={folder.data} /> : <div>Loading...</div>}
      </ToggleRow>
    </div>
  )
}

const FolderContents: React.FC<{
  disklet: DiskletType
  folder: DiskletListing
}> = ({ disklet, folder }) => {
  if (Object.entries(folder).length <= 0) {
    return (
      <ListGroup>
        <ListGroup.Item>Empty</ListGroup.Item>
      </ListGroup>
    )
  }

  return (
    <ListGroup>
      {Object.entries(folder).map(([key, value]) =>
        value === 'folder' ? (
          <ListGroup.Item key={key}>
            <Folder disklet={disklet} path={key} />
          </ListGroup.Item>
        ) : value === 'file' ? (
          <ListGroup.Item key={key}>
            <File disklet={disklet} path={key} />
          </ListGroup.Item>
        ) : null,
      )}
    </ListGroup>
  )
}

export const File: React.FC<{ disklet: DiskletType; path: string }> = ({ disklet, path }) => {
  const file = useFile<Record<string, any>>(disklet, { path })

  return (
    <div style={{ paddingLeft: '20px' }}>
      <ToggleRow title={fileName(path)} onOpen={file.execute} onDelete={() => disklet.delete(path)}>
        {file.data ? <FileContents file={file.data} /> : <div>Loading...</div>}
      </ToggleRow>
    </div>
  )
}

const FileContents: React.FC<{ file: Record<string, any> }> = ({ file }) => <Json data={file} />
