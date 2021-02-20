import React from 'react'

import { useEdgeAccount } from '../../auth'
import { Button, Form, FormGroup, ListGroup, ListGroupItem, Tab, Tabs } from '../../components'
import { usePassword } from '../../hooks'

export const Password = () => {
  return (
    <Tabs defaultActiveKey={'checkPassword'}>
      <Tab title={'Check Password'} eventKey={'checkPassword'}>
        <CheckPassword />
      </Tab>

      <Tab title={'Change Password'} eventKey={'changePassword'}>
        <ChangePassword />
      </Tab>

      <Tab title={'Delete Password'} eventKey={'deletePassword'}>
        <DeletePassword />
      </Tab>
    </Tabs>
  )
}

const CheckPassword = () => {
  const account = useEdgeAccount()
  const {
    checkPassword: { mutateAsync: checkPassword, data: isCorrect, error, reset, isLoading },
  } = usePassword(account)
  const [password, setPassword] = React.useState('')

  React.useEffect(() => {
    if (isCorrect == null) return
    const timeout = setTimeout(reset, 3000)

    return () => {
      clearTimeout(timeout)
    }
  }, [isCorrect, reset])

  return (
    <ListGroup style={{ paddingTop: 4, paddingBottom: 4 }}>
      <ListGroupItem>
        <Form
          id={`checkPassword`}
          onSubmit={(event: React.FormEvent) => {
            event.preventDefault()
            checkPassword(password).finally(() => {
              setTimeout(() => {
                reset()
                setPassword('')
              }, 3000)
            })
          }}
        >
          <FormGroup>
            <Form.Row>
              <Form.Control
                value={password}
                disabled={isLoading}
                onChange={(event) => {
                  event.preventDefault()
                  reset()
                  setPassword(event.currentTarget.value)
                }}
              />

              <Button type={'submit'} variant="primary" disabled={isLoading} form={'checkPassword'}>
                {isLoading ? '...' : 'Submit'}
              </Button>
            </Form.Row>
          </FormGroup>
        </Form>
        {isCorrect != null ? <div>{String(isCorrect)}</div> : null}
        {error instanceof Error ? <div>{error.message}</div> : null}
      </ListGroupItem>
    </ListGroup>
  )
}

const ChangePassword = () => {
  const account = useEdgeAccount()
  const {
    changePassword: { mutateAsync: changePassword, error, isLoading },
  } = usePassword(account)
  const [password, setPassword] = React.useState('')

  return (
    <ListGroup style={{ paddingTop: 4, paddingBottom: 4 }}>
      <ListGroupItem>
        <Form
          id={`password`}
          onSubmit={(event: React.FormEvent) => {
            event.preventDefault()
            changePassword(password).finally(() => setPassword(''))
          }}
        >
          <FormGroup>
            <Form.Row>
              <Form.Control
                type={'password'}
                disabled={isLoading}
                value={password}
                onChange={(event) => {
                  event.preventDefault()
                  setPassword(event.currentTarget.value)
                }}
              />

              <Button type={'submit'} variant="primary" disabled={isLoading} form={'password'}>
                {isLoading ? '...' : 'Submit'}
              </Button>
            </Form.Row>
          </FormGroup>
        </Form>
        {error instanceof Error ? <div>{error.message}</div> : null}
      </ListGroupItem>
    </ListGroup>
  )
}

const DeletePassword = () => {
  const account = useEdgeAccount()
  const {
    deletePassword: { mutate: deletePassword, error, isLoading },
  } = usePassword(account)

  return (
    <ListGroup style={{ paddingTop: 4, paddingBottom: 4 }}>
      <ListGroupItem>
        <Form>
          <FormGroup>
            <Button disabled={isLoading} onClick={() => deletePassword()} variant={'danger'}>
              Confirm
            </Button>
          </FormGroup>
        </Form>
        {error instanceof Error ? <div>{error.message}</div> : null}
      </ListGroupItem>
    </ListGroup>
  )
}
