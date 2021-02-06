import React from 'react'
import { Form, FormGroup, ListGroup, ListGroupItem } from 'react-bootstrap'

import { useEdgeAccount } from '../../auth'
import { useEdgeContext } from '../../Edge'
import { usePin } from '../../hooks'

export const PinLogin = () => {
  const context = useEdgeContext()
  const account = useEdgeAccount()
  const {
    pinLoginEnabled,
    changePinLogin: { mutate: changePinLogin, error, isLoading },
  } = usePin(context, account)

  return (
    <ListGroup style={{ paddingTop: 4, paddingBottom: 4 }}>
      <ListGroupItem>
        Pin Login: {String(pinLoginEnabled)}
        <Form>
          <FormGroup>
            <Form.Check
              type={'switch'}
              checked={pinLoginEnabled}
              label={'Enabled'}
              id={'pinLoginEnabled'}
              onChange={() => changePinLogin(!pinLoginEnabled)}
              disabled={isLoading}
            />
          </FormGroup>
        </Form>
        {error instanceof Error ? <div>{error.message}</div> : null}
      </ListGroupItem>
    </ListGroup>
  )
}
