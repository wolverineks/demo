import { EdgeAccount } from 'edge-core-js'
import React from 'react'
import { Alert, Button, Card, Form, FormControl, ListGroup } from 'react-bootstrap'

import { Boundary } from '../components'
import { useEdgeContext } from '../Edge'
import { useAccountsWithPinLogin, useLoginMessages, useLoginWithPin } from '../hooks'

export const PinLogin: React.FC<{ onLogin: (account: EdgeAccount) => any }> = ({ onLogin }) => {
  const accountsWithPinLogin = useAccountsWithPinLogin(useEdgeContext())

  return (
    <ListGroup>
      {accountsWithPinLogin.length <= 0 ? (
        <Card.Text>------</Card.Text>
      ) : (
        accountsWithPinLogin.map(({ username }) => (
          <LocalUserRow username={username} key={username} onLogin={onLogin} />
        ))
      )}
    </ListGroup>
  )
}

const LocalUserRow: React.FC<{ username: string; onLogin: (account: EdgeAccount) => any }> = ({
  username,
  onLogin,
}) => {
  const [pin, setPin] = React.useState('')
  const [loginWithPin, { status, error, reset }] = useLoginWithPin(useEdgeContext())

  return (
    <ListGroup.Item>
      <Form
        id={`pin-login ${username}`}
        onSubmit={(event: React.FormEvent) => {
          event.preventDefault()
          loginWithPin({ username, pin }, { onSuccess: onLogin })
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

      {status === 'error' && <Alert variant={'danger'}>{error?.message}</Alert>}
      <Boundary>
        <LoginMessages username={username} />
      </Boundary>
    </ListGroup.Item>
  )
}

const LoginMessages: React.FC<{ username: string }> = ({ username }) => {
  const { otpResetPending, recovery2Corrupt } = useLoginMessages(useEdgeContext(), username)

  return (
    <ListGroup key={username}>
      <ListGroup.Item>otpResetPending: {otpResetPending.toString()}</ListGroup.Item>
      <ListGroup.Item>recovery2Corrupt: {recovery2Corrupt.toString()}</ListGroup.Item>
    </ListGroup>
  )
}
