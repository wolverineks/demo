import React from 'react'
import { Form, FormControl, FormGroup, FormLabel, ListGroup, ListGroupItem } from 'react-bootstrap'
import { useIdleTimer } from 'react-idle-timer'

import { useAccount, useSetAccount } from '../auth'
import { useAutoLogout } from '../hooks'

export const AutoLogout = () => {
  const account = useAccount()
  const [{ enabled, delay }, write] = useAutoLogout(account)
  const setAccount = useSetAccount()

  const onIdle = () => {
    setAccount()
    account.logout()
  }

  return (
    <>
      <ListGroup style={{ paddingTop: 4, paddingBottom: 4 }}>
        <ListGroupItem>
          <Form>
            <FormGroup>
              <FormLabel>AutoLogout: {delay}</FormLabel>
              {enabled && delay >= 30 && <IdleTimeout delay={delay} onIdle={onIdle} />}
              <FormControl
                onChange={(event) =>
                  write({
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

const IdleTimeout: React.FC<{ onIdle: () => void; delay: number }> = ({ onIdle, delay }) => {
  const [remainingTime, setRemainingTime] = React.useState(delay)
  const { getRemainingTime } = useIdleTimer({ timeout: delay * 1000, onIdle })

  React.useEffect(() => {
    setInterval(() => setRemainingTime(getRemainingTime()), 1000)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <div>Remaining Time: {(remainingTime / 1000).toFixed(0)}</div>
}
