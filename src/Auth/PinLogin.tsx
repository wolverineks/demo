import { useDeleteLocalAccount, useLoginWithPin } from 'edge-react-hooks'
import * as React from 'react'
import { Alert, Button, Card, Col, Form, FormControl, FormLabel, ListGroup } from 'react-bootstrap'

import { useEdgeContext } from '../Edge'
import { useLoginMessages, useTimeout } from '../hooks'
import { getAccountsWithPinLogin } from '../utils'
// eslint-disable-next-line import/no-unresolved
import { useSetAccount } from './AccountProvider'

export const PinLogin: React.FC<{ onLogin: () => any }> = ({ onLogin }) => {
  const context = useEdgeContext()
  const accountsWithPinLogin = getAccountsWithPinLogin({ context })

  return (
    <ListGroup>
      {accountsWithPinLogin.length <= 0 ? (
        <Card.Text>------</Card.Text>
      ) : (
        accountsWithPinLogin.map(({ username }) => (
          // <Boundary key={username}>
          <LocalUserRow username={username} key={username} onLogin={onLogin} />
          // </Boundary>
        ))
      )}
    </ListGroup>
  )
}

const LocalUserRow: React.FC<{ username: string; onLogin: () => any }> = ({ username, onLogin }) => {
  const context = useEdgeContext()
  const [pin, setPin] = React.useState('')
  const deleteLocalAccount = useDeleteLocalAccount(context)
  const loginWithPin = useLoginWithPin(context)
  const pending = loginWithPin.status === 'loading' || deleteLocalAccount.status === 'loading'
  const setAccount = useSetAccount()

  const timeout = useTimeout()
  React.useEffect(() => {
    deleteLocalAccount.error && timeout(deleteLocalAccount.reset, 2500)
  }, [deleteLocalAccount.error, deleteLocalAccount.reset, timeout])

  const handleLogin = () => {
    loginWithPin.execute({ username, pin }).then((account) => {
      setAccount(account)
      onLogin()
    })
  }

  const handleDeleteLocalAccount = () => deleteLocalAccount.execute({ username })

  return (
    <ListGroup.Item>
      <Form
        id={`pin-login ${username}`}
        onSubmit={(event: React.FormEvent) => {
          event.preventDefault()
          handleLogin()
        }}
      >
        <Form.Row>
          <FormLabel>{username} - PIN</FormLabel>
          <Col>
            <FormControl
              disabled={pending}
              onChange={(event) => {
                event.preventDefault()
                loginWithPin.reset()
                setPin(event.currentTarget.value)
              }}
            />
          </Col>
        </Form.Row>
      </Form>

      <Form.Row>
        <Button type={'submit'} variant="primary" disabled={pending} form={`pin-login ${username}`}>
          {loginWithPin.status === 'loading' ? '...' : 'Login'}
        </Button>

        <Button
          variant="danger"
          disabled={pending}
          onClick={(event: React.FormEvent) => {
            event.preventDefault()
            handleDeleteLocalAccount()
          }}
        >
          {deleteLocalAccount.status === 'loading' ? '...' : 'Remove Account'}
        </Button>
      </Form.Row>

      {loginWithPin.error && <Alert variant={'danger'}>{loginWithPin.error.message}</Alert>}
      {deleteLocalAccount.error && <Alert variant={'danger'}>{deleteLocalAccount.error.message}</Alert>}
      <LoginMessages username={username} />
    </ListGroup.Item>
  )
}

const LoginMessages: React.FC<{ username: string }> = ({ username }) => {
  const context = useEdgeContext()
  const { otpResetPending, recovery2Corrupt } = useLoginMessages({ context, username })

  return (
    <ListGroup key={username}>
      <ListGroup.Item>otpResetPending: {otpResetPending.toString()}</ListGroup.Item>
      <ListGroup.Item>recovery2Corrupt: {recovery2Corrupt.toString()}</ListGroup.Item>
    </ListGroup>
  )
}
