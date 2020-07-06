import { useLoginWithPassword } from 'edge-react-hooks'
import * as React from 'react'
import { Alert, Button, Form, FormGroup } from 'react-bootstrap'

import { useEdgeContext } from '../Edge'
import { useSetAccount } from './AccountProvider'

export const LoginForm: React.FC<{ onLogin: () => any }> = ({ onLogin }) => {
  const context = useEdgeContext()

  const setAccount = useSetAccount()
  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')
  const { execute: loginWithPassword, error, status, reset } = useLoginWithPassword(context)

  const onUsernameChange = (username: string) => {
    reset()
    setUsername(username)
  }

  const onPasswordChange = (password: string) => {
    reset()
    setPassword(password)
  }

  const onSubmit = () => {
    loginWithPassword({ username, password }).then(setAccount).finally(onLogin)
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
            onSubmit()
          }}
        >
          {status === 'loading' ? '...' : 'Login'}
        </Button>
      </FormGroup>
    </Form>
  )
}
