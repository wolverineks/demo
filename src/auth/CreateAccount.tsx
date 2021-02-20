import { EdgeAccount, EdgeContext } from 'edge-core-js'
import React from 'react'

import { Alert, Button, Form, FormGroup } from '../components'
import { useCreateAccount } from '../hooks'

const onChange = (cb: (value: string) => any) => (event: any) => cb(event.currentTarget.value)

export const CreateAccount: React.FC<{ context: EdgeContext; onLogin: (account: EdgeAccount) => any }> = ({
  onLogin,
  context,
}) => {
  const { mutate: createAccount, status, error } = useCreateAccount(context)
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

      {error && <Alert variant={'danger'}>{(error as Error).message.toString()}</Alert>}
      <FormGroup>
        <Button
          variant={'primary'}
          disabled={pending}
          onClick={() => createAccount({ username, password, pin, otp: '' }, { onSuccess: onLogin })}
        >
          {pending ? 'Creating account...' : 'Create'}
        </Button>
      </FormGroup>
    </Form>
  )
}
