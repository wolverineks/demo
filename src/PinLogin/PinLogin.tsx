import * as React from 'react'
import { Form, FormGroup, ListGroup, ListGroupItem } from 'react-bootstrap'

import { useAccount } from '../auth'
import { useEdgeContext } from '../Edge'
import { usePinLoginEnabled } from '../hooks'

export const PinLogin = () => {
  const account = useAccount()
  const context = useEdgeContext()
  const [enabled, write] = usePinLoginEnabled({ context, account })

  return (
    <ListGroup style={{ paddingTop: 4, paddingBottom: 4 }}>
      <ListGroupItem>
        Pin Login: {String(enabled)}
        <Form>
          <FormGroup>
            <Form.Check
              type={'switch'}
              checked={enabled}
              label={'Pin Login Enabled'}
              id={'pinLoginEnabled'}
              onChange={() => (write as any)(!enabled)} // FIXME
            />
          </FormGroup>
        </Form>
      </ListGroupItem>
    </ListGroup>
  )
}
