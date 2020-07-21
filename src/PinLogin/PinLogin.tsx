import React from 'react'
import { Form, FormGroup, ListGroup, ListGroupItem } from 'react-bootstrap'

import { useAccount } from '../auth'
import { useEdgeContext } from '../Edge'
import { usePinLoginEnabled } from '../hooks'

export const PinLogin = () => {
  const [enabled, write] = usePinLoginEnabled(useEdgeContext(), useAccount())

  return (
    <ListGroup style={{ paddingTop: 4, paddingBottom: 4 }}>
      <ListGroupItem>
        Pin Login: {String(enabled)}
        <Form>
          <FormGroup>
            <Form.Check
              type={'switch'}
              checked={enabled}
              label={'Enabled'}
              id={'pinLoginEnabled'}
              onChange={() => (write as any)(!enabled)} // FIXME
            />
          </FormGroup>
        </Form>
      </ListGroupItem>
    </ListGroup>
  )
}
