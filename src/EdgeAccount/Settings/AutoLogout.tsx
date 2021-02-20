import React from 'react'

import { useEdgeAccount } from '../../auth'
import { AutologoutContext } from '../../AutoLogout'
import { Form, FormControl, FormGroup, FormLabel, ListGroup, ListGroupItem } from '../../components'
import { useAutoLogout } from '../../hooks'

export const AutoLogout = () => {
  const account = useEdgeAccount()
  const [{ enabled, delay }, setAutologout] = useAutoLogout(account)
  const remainingTime = React.useContext(AutologoutContext)

  return (
    <>
      <ListGroup style={{ paddingTop: 4, paddingBottom: 4 }}>
        <ListGroupItem>
          <Form>
            <FormGroup>
              <FormLabel>AutoLogout: {delay}</FormLabel>
              {enabled ? <div>Remaining Time: {(remainingTime / 1000).toFixed(0)}</div> : null}
              <FormControl
                onChange={(event) =>
                  setAutologout({
                    delay: Math.max(Number(event.currentTarget.value), 30),
                    enabled: true,
                  })
                }
                value={String(delay)}
              />

              <Form.Check
                id={'autoLogoutEnabled'}
                type={'switch'}
                label={'enabled'}
                onChange={() => setAutologout({ enabled: !enabled, delay: Math.max(delay, 30) })}
                checked={enabled}
              />
            </FormGroup>
          </Form>
        </ListGroupItem>
      </ListGroup>
    </>
  )
}
