import { EdgeAccount, EdgeContext } from 'edge-core-js'
import React from 'react'

import { Alert, Button, Form, FormGroup } from '../components'
import { fakeUser } from '../Edge'
import { useLoginWithKey, useLoginWithPassword } from '../hooks'

export const PasswordLogin: React.FC<{ context: EdgeContext; onLogin: (account: EdgeAccount) => any }> = ({
  onLogin,
  context,
}) => {
  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')
  const {
    mutate: loginWithPassword,
    error: passwordError,
    status: passwordStatus,
    reset: resetPassword,
  } = useLoginWithPassword(context, { onSuccess: onLogin })
  const {
    mutate: loginWithKey,
    error: keyError,
    status: keyStatus,
    reset: resetKey,
  } = useLoginWithKey(context, { onSuccess: onLogin })
  const error = passwordError || keyError
  const status = passwordStatus === 'loading' || keyStatus === 'loading' ? 'loading' : passwordStatus
  const reset = () => {
    resetPassword()
    resetKey()
  }

  const onUsernameChange = (username: string) => {
    reset()
    setUsername(username)
  }

  const onPasswordChange = (password: string) => {
    reset()
    setPassword(password)
  }

  return (
    <Form>
      <FormGroup>
        <Form.Label>Username</Form.Label>
        <Form.Control
          type={'username'}
          autoComplete={'username'}
          disabled={status === 'loading'}
          onChange={(event) => onUsernameChange(event.currentTarget.value)}
        />
      </FormGroup>

      <FormGroup>
        <Form.Label>Password</Form.Label>
        <Form.Control
          type={'password'}
          autoComplete={'password'}
          disabled={status === 'loading'}
          onChange={(event) => onPasswordChange(event.currentTarget.value)}
        />
      </FormGroup>

      {error && <Alert variant={'danger'}>{(error as Error).message}</Alert>}

      <FormGroup>
        <Button
          variant="primary"
          disabled={status === 'loading'}
          onClick={(event: React.MouseEvent) => {
            event.preventDefault()
            loginWithPassword({ username, password })
          }}
        >
          {status === 'loading' ? '...' : 'Login'}
        </Button>{' '}
        {process.env.NODE_ENV !== 'production' && (
          <Button
            variant="secondary"
            disabled={status === 'loading'}
            onClick={(event: React.MouseEvent) => {
              event.preventDefault()
              loginWithKey({ username: fakeUser.username, loginKey: fakeUser.loginKeyBase58 })
            }}
          >
            {status === 'loading' ? '...' : 'Login with fake user'}
          </Button>
        )}
      </FormGroup>
    </Form>
  )
}
