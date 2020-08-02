import { EdgeAccount, EdgeContext } from 'edge-core-js'
import React from 'react'
import { Alert, Button, Card, Form, FormControl, ListGroup } from 'react-bootstrap'

import { Boundary } from '../components'
import { useAccountsWithPinLogin, useLoginMessages, useLoginWithPin } from '../hooks'

export const PinLogin: React.FC<{ context: EdgeContext; onLogin: (account: EdgeAccount) => any }> = ({
  onLogin,
  context,
}) => {
  const accountsWithPinLogin = useAccountsWithPinLogin(context)
  const loginWithPin = useLoginWithPin(context, { onSuccess: onLogin })

  return (
    <ListGroup>
      {accountsWithPinLogin.length <= 0 ? (
        <Card.Text>------</Card.Text>
      ) : (
        accountsWithPinLogin.map(({ username }) => (
          <LocalUserRow loginWithPin={loginWithPin} username={username} key={username} context={context} />
        ))
      )}
    </ListGroup>
  )
}

const LocalUserRow: React.FC<{
  loginWithPin: ReturnType<typeof useLoginWithPin>
  context: EdgeContext
  username: string
}> = ({ username, context, loginWithPin: [loginWithPin, { reset, error, status }] }) => {
  const [pin, setPin] = React.useState('')

  return (
    <ListGroup.Item>
      <Form
        id={`pin-login ${username}`}
        onSubmit={(event: React.FormEvent) => {
          event.preventDefault()
          loginWithPin({ username, pin })
        }}
      >
        <Form.Row>
          <FormControl type={'username'} readOnly value={username} />

          <FormControl
            disabled={status === 'loading'}
            onChange={(event) => {
              event.preventDefault()
              reset()
              setPin(event.currentTarget.value)
            }}
          />

          <Button type={'submit'} variant="primary" disabled={status === 'loading'} form={`pin-login ${username}`}>
            {status === 'loading' ? '...' : 'Login'}
          </Button>
        </Form.Row>
      </Form>

      {error && <Alert variant={'danger'}>{(error as Error).message}</Alert>}
      <Boundary>
        <LoginMessages username={username} context={context} />
      </Boundary>
    </ListGroup.Item>
  )
}

const LoginMessages: React.FC<{ username: string; context: EdgeContext }> = ({ username, context }) => {
  const { otpResetPending, recovery2Corrupt } = useLoginMessages(context, username)

  return (
    <ListGroup key={username}>
      <ListGroup.Item>otpResetPending: {otpResetPending.toString()}</ListGroup.Item>
      <ListGroup.Item>recovery2Corrupt: {recovery2Corrupt.toString()}</ListGroup.Item>
    </ListGroup>
  )
}
