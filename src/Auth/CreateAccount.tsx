import { EdgeAccount } from 'edge-core-js'
import { useCreateAccount } from 'edge-react-hooks'
import React from 'react'
import { Alert, Button, Form, FormGroup } from 'react-bootstrap'

import { useEdgeContext } from '../Edge'

const onChange = (cb: (value: string) => any) => (event: any) => cb(event.currentTarget.value)

export const CreateAccount: React.FC<{ onLogin: (account: EdgeAccount) => any }> = ({ onLogin }) => {
  const context = useEdgeContext()

  const { execute: createAccount, error, status } = useCreateAccount(context)
  const pending = status === 'loading'
  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [pin, setPin] = React.useState('')

  return (
    <Form>
      <FormGroup>
        <Form.Label>Username</Form.Label>
        <Form.Control required disabled={pending} type={'username'} onChange={onChange(setUsername)} />
      </FormGroup>

      <FormGroup>
        <Form.Label>Password</Form.Label>
        <Form.Control
          required
          disabled={pending}
          type={'password'}
          autoComplete={'new-password'}
          onChange={onChange(setPassword)}
        />
      </FormGroup>

      <FormGroup>
        <Form.Label>Pin</Form.Label>
        <Form.Control required disabled={pending} type={'number'} onChange={onChange(setPin)} />
      </FormGroup>

      {error && <Alert variant={'danger'}>{error.message.toString()}</Alert>}
      <FormGroup>
        <Button
          variant={'primary'}
          disabled={pending}
          onClick={() => createAccount({ username, password, pin }, { onSuccess: onLogin })}
        >
          {pending ? 'Creating account...' : 'Create'}
        </Button>
      </FormGroup>
    </Form>
  )
}
