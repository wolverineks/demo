import * as React from 'react'
import { Form, FormControl, FormGroup, FormLabel, ListGroup, ListGroupItem } from 'react-bootstrap'
import IdleTimer from 'react-idle-timer'

import { useAccount, useSetAccount } from '../Auth'
import { useAutoLogout } from './useAutoLogout'

export const AutoLogout = () => {
  const account = useAccount()
  const [{ enabled, delay }, write] = useAutoLogout({ account })
  const setAccount = useSetAccount()

  const onIdle = () => {
    setAccount()
    account.logout()
  }

  return (
    <>
      {enabled && delay >= 30 && <IdleTimer element={document} onIdle={onIdle} timeout={delay * 1000} />}

      <ListGroup style={{ paddingTop: 4, paddingBottom: 4 }}>
        <ListGroupItem>
          <Form>
            <FormGroup>
              <FormLabel>AutoLogout: {delay}</FormLabel>
              <FormControl
                onChange={(event) =>
                  write({
                    delay: Math.max(Number(event.currentTarget.value), 30),
                    enabled: true,
                  })
                }
                value={String(delay)}
              />

              <FormLabel>Enabled</FormLabel>
              <Form.Check
                id={'autoLogoutEnabled'}
                type={'switch'}
                label={'enabled'}
                onChange={() => write({ enabled: !enabled, delay: Math.max(delay, 30) })}
                checked={enabled}
              />
            </FormGroup>
          </Form>
        </ListGroupItem>
      </ListGroup>
    </>
  )
}
