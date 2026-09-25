import { EdgeAccount } from 'edge-core-js'
import React from 'react'

import { Alert, Boundary, Button, Card, Form, FormControl, ListGroup, Select } from '../components'
import { useAccountsWithPinLogin, useLoginMessages, useLoginWithPin } from '../hooks'

export const PinLogin: React.FC<{ onLogin: (account: EdgeAccount) => any }> = ({ onLogin }) => {
  const accountsWithPinLogin = useAccountsWithPinLogin()
  const [username, setUsername] = React.useState(accountsWithPinLogin[0]?.username)
  const loginWithPin = useLoginWithPin({ onSuccess: onLogin, onError: alert })

  return (
    <ListGroup>
      <Select
        disabled={loginWithPin.isLoading}
        onSelect={(event) => setUsername(event.currentTarget.value)}
        title={'Accounts'}
        options={accountsWithPinLogin}
        renderOption={(option) => (
          <option key={option.username} value={option.username}>
            {option.username}
          </option>
        )}
      />
      {accountsWithPinLogin.length <= 0 ? (
        <Card.Text>------</Card.Text>
      ) : (
        <LocalUserRow loginWithPin={loginWithPin} username={username ?? ''} />
      )}
    </ListGroup>
  )
}

const LocalUserRow: React.FC<{
  loginWithPin: ReturnType<typeof useLoginWithPin>
  username: string
}> = ({ username, loginWithPin: { mutate: loginWithPin, reset, error, status } }) => {
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
        <LoginMessages username={username} />
      </Boundary>
    </ListGroup.Item>
  )
}

const LoginMessages: React.FC<{ username: string }> = ({ username }) => {
  const { otpResetPending, recovery2Corrupt } = useLoginMessages(username)

  return (
    <ListGroup key={username}>
      <ListGroup.Item>otpResetPending: {otpResetPending.toString()}</ListGroup.Item>
      <ListGroup.Item>recovery2Corrupt: {recovery2Corrupt.toString()}</ListGroup.Item>
    </ListGroup>
  )
}
