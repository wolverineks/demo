import { EdgeAccount } from 'edge-core-js'
import React from 'react'
import { Form, FormControl, FormGroup, FormLabel, ListGroup, ListGroupItem } from 'react-bootstrap'
import { useIdleTimer } from 'react-idle-timer'
import { QueryOptions, useMutation, useQuery, useQueryClient } from 'react-query'

import { useEdgeAccount, useSetAccount } from '../auth'

export const AutoLogout = () => {
  const account = useEdgeAccount()
  const [{ enabled, delay }, setAutologout] = useAutoLogout(account)
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

const IdleTimeout: React.FC<{ onIdle: () => void; delay: number }> = ({ onIdle, delay }) => {
  const [remainingTime, setRemainingTime] = React.useState(delay)
  const { getRemainingTime } = useIdleTimer({ timeout: delay * 1000, onIdle })

  React.useEffect(() => {
    setInterval(() => setRemainingTime(getRemainingTime()), 1000)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <div>Remaining Time: {(remainingTime / 1000).toFixed(0)}</div>
}

const defaultAutoLogout = { enabled: true, delay: 3600 }

type AutoLogoutSetting = {
  enabled: boolean
  delay: number
}

export const useReadAutoLogout = (account: EdgeAccount, config?: QueryOptions<AutoLogoutSetting>) => {
  return useQuery({
    queryKey: [account.username, 'autoLogout'],
    queryFn: () =>
      account.dataStore
        .getItem('autoLogout', 'autoLogout.json')
        .then(JSON.parse)
        .catch(() => defaultAutoLogout) as Promise<AutoLogoutSetting>,
    ...config,
  })
}

export const useWriteAutoLogout = (account: EdgeAccount) => {
  const mutationFn = (autoLogout: AutoLogoutSetting) =>
    account.dataStore.setItem('autoLogout', 'autoLogout.json', JSON.stringify(autoLogout))
  const queryClient = useQueryClient()
  const queryKey = [account.username, 'autoLogout']

  return useMutation(mutationFn, {
    onMutate: () => queryClient.cancelQueries(queryKey),
    onSettled: () => queryClient.invalidateQueries(queryKey),
  })
}

export const useAutoLogout = (account: EdgeAccount) => {
  return [useReadAutoLogout(account).data!, useWriteAutoLogout(account).mutate] as const
}
