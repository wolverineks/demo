import { EdgeAccount, EdgeContext } from 'edge-core-js'
import React from 'react'
import { Alert, Button, Form, FormGroup } from 'react-bootstrap'

import { useLoginWithPassword } from '../hooks'

export const PasswordLogin: React.FC<{ context: EdgeContext; onLogin: (account: EdgeAccount) => any }> = ({
  onLogin,
  context,
}) => {
  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loginWithPassword, { error, status, reset }] = useLoginWithPassword(context, { onSuccess: onLogin })

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
        </Button>
      </FormGroup>
    </Form>
  )
}
