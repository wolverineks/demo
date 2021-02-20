import { EdgeAccount, EdgeContext } from 'edge-core-js'
import React from 'react'

import { Alert, Boundary, Button, Card, Form, FormControl, ListGroup, Select } from '../components'
import { useAccountsWithPinLogin, useLoginMessages, useLoginWithPin } from '../hooks'

export const PinLogin: React.FC<{ context: EdgeContext; onLogin: (account: EdgeAccount) => any }> = ({
  onLogin,
  context,
}) => {
  const accountsWithPinLogin = useAccountsWithPinLogin(context)
  const [username, setUsername] = React.useState(accountsWithPinLogin[0]?.username)
  const loginWithPin = useLoginWithPin(context, { onSuccess: onLogin })

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
        <LocalUserRow loginWithPin={loginWithPin} username={username} context={context} />
      )}
    </ListGroup>
  )
}

const LocalUserRow: React.FC<{
  loginWithPin: ReturnType<typeof useLoginWithPin>
  context: EdgeContext
  username: string
}> = ({ username, context, loginWithPin: { mutate: loginWithPin, reset, error, status } }) => {
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
