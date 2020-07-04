import { useDeleteLocalAccount, useLoginMessages, useLoginWithPin } from 'edge-react-hooks'
import * as React from 'react'
import { Alert, Button, Card, Col, Form, FormControl, FormLabel, ListGroup } from 'react-bootstrap'

import { useEdgeContext } from '../Edge'
import { useTimeout } from '../utils/useTimeout'
import { useSetAccount } from './AccountProvider'
import { getAccountsWithPinLogin } from './getAccountsWithPinLogin'

export const PinLogin: React.FC = () => {
  const context = useEdgeContext()
  const accountsWithPinLogin = getAccountsWithPinLogin({ context })

  return (
    <ListGroup>
      {accountsWithPinLogin.length <= 0 ? (
        <Card.Text>------</Card.Text>
      ) : (
        accountsWithPinLogin.map(({ username }) => <LocalUserRow username={username} key={username} />)
      )}
    </ListGroup>
  )
}

const LocalUserRow: React.FC<{ username: string }> = ({ username }) => {
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

  const handleLogin = () => loginWithPin.execute({ username, pin }).then(setAccount)

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
  const loginMessages = useLoginMessages(context, { username })

  return loginMessages.status === 'success' ? (
    <ListGroup key={username}>
      {Object.keys(loginMessages).length <= 0 ? (
        <ListGroup.Item>No messages</ListGroup.Item>
      ) : (
        <>
          <ListGroup.Item>otpResetPending: {loginMessages.data.otpResetPending.toString()}</ListGroup.Item>
          <ListGroup.Item>recovery2Corrupt: {loginMessages.data.recovery2Corrupt.toString()}</ListGroup.Item>
        </>
      )}
    </ListGroup>
  ) : loginMessages.status === 'error' ? (
    <ListGroup key={username}>
      <ListGroup.Item>{loginMessages.error.message}</ListGroup.Item>
    </ListGroup>
  ) : (
    <ListGroup key={username}>
      <ListGroup.Item>Loading...</ListGroup.Item>
    </ListGroup>
  )
}
