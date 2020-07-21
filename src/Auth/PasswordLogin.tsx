import { EdgeAccount } from 'edge-core-js'
import React from 'react'
import { Alert, Button, Form, FormGroup } from 'react-bootstrap'

import { useEdgeContext } from '../Edge'
import { useLoginWithPassword } from '../hooks'

export const PasswordLogin: React.FC<{ onLogin: (account: EdgeAccount) => any }> = ({ onLogin }) => {
  const context = useEdgeContext()

  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loginWithPassword, { error, status, reset }] = useLoginWithPassword(context)

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
          disabled={status === 'loading'}
          onChange={(event) => onUsernameChange(event.currentTarget.value)}
        />
      </FormGroup>

      <FormGroup>
        <Form.Label>Password</Form.Label>
        <Form.Control
          type={'password'}
          autoComplete={'new-password'}
          disabled={status === 'loading'}
          onChange={(event) => onPasswordChange(event.currentTarget.value)}
        />
      </FormGroup>

      {error && <Alert variant={'danger'}>{error.message}</Alert>}

      <FormGroup>
        <Button
          variant="primary"
          disabled={status === 'loading'}
          onClick={(event: React.MouseEvent) => {
            event.preventDefault()
            loginWithPassword({ username, password }, { onSuccess: onLogin })
          }}
        >
          {status === 'loading' ? '...' : 'Login'}
        </Button>
      </FormGroup>
    </Form>
  )
}
