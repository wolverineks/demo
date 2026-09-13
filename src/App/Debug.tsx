import React from 'react'

import { Button, Card, ListGroup } from '../components'
import { libraryVersions } from '../Edge/libraryVersions'

const fabStyle: React.CSSProperties = {
  position: 'fixed',
  right: 16,
  bottom: 16,
  zIndex: 1080,
}

const panelStyle: React.CSSProperties = {
  position: 'fixed',
  right: 16,
  bottom: 64,
  zIndex: 1080,
  minWidth: 280,
}

export const Debug = () => {
  const [open, setOpen] = React.useState(false)

  return (
    <>
      {open && (
        <Card style={panelStyle}>
          <Card.Header>Edge libraries</Card.Header>
          <ListGroup variant="flush">
            {libraryVersions.map(({ name, version }) => (
              <ListGroup.Item key={name}>
                {name}: {version}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card>
      )}

      <Button style={fabStyle} variant="secondary" onClick={() => setOpen((current) => !current)}>
        Debug
      </Button>
    </>
  )
}
