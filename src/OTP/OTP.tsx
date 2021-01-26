import React from 'react'
import { Form, FormGroup, ListGroup, ListGroupItem } from 'react-bootstrap'

import { useEdgeAccount } from '../auth'
import { useOTP } from '../hooks'

export const OTP = () => {
  const account = useEdgeAccount()
  const { enableOTP, disableOTP, enabled, otpKey } = useOTP(account)

  return (
    <ListGroup style={{ paddingTop: 4, paddingBottom: 4 }}>
      <ListGroupItem>
        OTP: {String(enabled)} {otpKey}
        <Form>
          <FormGroup>
            <Form.Check
              type={'switch'}
              checked={enabled}
              label={'Enabled'}
              id={'otpLoginEnabled'}
              onChange={() => (enabled ? disableOTP() : enableOTP())}
            />
          </FormGroup>
        </Form>
      </ListGroupItem>
    </ListGroup>
  )
}
