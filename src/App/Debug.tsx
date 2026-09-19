import React from 'react'

import { Button, Card, ListGroup } from '../components'
import { libraryVersions } from '../Edge/libraryVersions'

export const Debug = () => {
  const [open, setOpen] = React.useState(false)

  return (
    <>
      {open && (
        <Card className="debug-panel">
          <Card.Header>Edge libraries</Card.Header>
          <ListGroup variant="flush">
            {libraryVersions.map(({ name, version }) => (
              <ListGroup.Item key={name} className="debug-row">
                <span className="debug-row__name">{name}</span>
                <span className="debug-row__version">{version}</span>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card>
      )}

      <Button className="debug-fab" variant="dark" onClick={() => setOpen((current) => !current)}>
        Debug
      </Button>
    </>
  )
}
