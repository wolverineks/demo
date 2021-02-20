import React from 'react'

import { useEdgeAccount } from '../../auth'
import { Button, Form, FormGroup, ListGroup, ListGroupItem, Tab, Tabs } from '../../components'
import { useEdgeContext } from '../../Edge'
import { usePin } from '../../hooks'

export const Pin = () => {
  return (
    <Tabs defaultActiveKey={'checkPin'}>
      <Tab title={'Check Pin'} eventKey={'checkPin'}>
        <CheckPin />
      </Tab>

      <Tab title={'Change Pin'} eventKey={'changePin'}>
        <ChangePin />
      </Tab>

      <Tab title={'Delete Pin'} eventKey={'deletePin'}>
        <DeletePin />
      </Tab>
    </Tabs>
  )
}

const CheckPin = () => {
  const context = useEdgeContext()
  const account = useEdgeAccount()
  const {
    checkPin: { mutateAsync: checkPin, data: isCorrect, error, reset, isLoading },
  } = usePin(context, account)
  const [pin, setPin] = React.useState('')

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
          id={`checkPin`}
          onSubmit={(event: React.FormEvent) => {
            event.preventDefault()
            checkPin(pin).finally(() => {
              setTimeout(() => {
                reset()
                setPin('')
              }, 3000)
            })
          }}
        >
          <FormGroup>
            <Form.Row>
              <Form.Control
                value={pin}
                disabled={isLoading}
                onChange={(event) => {
                  event.preventDefault()
                  reset()
                  setPin(event.currentTarget.value)
                }}
              />

              <Button type={'submit'} variant="primary" disabled={isLoading} form={'checkPin'}>
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

const ChangePin = () => {
  const context = useEdgeContext()
  const account = useEdgeAccount()
  const {
    changePin: { mutateAsync: changePin, error, isLoading },
  } = usePin(context, account)
  const [pin, setPin] = React.useState('')

  return (
    <ListGroup style={{ paddingTop: 4, paddingBottom: 4 }}>
      <ListGroupItem>
        <Form
          id={`pin`}
          onSubmit={(event: React.FormEvent) => {
            event.preventDefault()
            changePin(pin).finally(() => setPin(''))
          }}
        >
          <FormGroup>
            <Form.Row>
              <Form.Control
                type={'password'}
                disabled={isLoading}
                value={pin}
                onChange={(event) => {
                  event.preventDefault()
                  setPin(event.currentTarget.value)
                }}
              />

              <Button type={'submit'} variant="primary" disabled={isLoading} form={'pin'}>
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

const DeletePin = () => {
  const context = useEdgeContext()
  const account = useEdgeAccount()
  const {
    deletePin: { mutate: deletePin, error, isLoading },
  } = usePin(context, account)

  return (
    <ListGroup style={{ paddingTop: 4, paddingBottom: 4 }}>
      <ListGroupItem>
        <Form>
          <FormGroup>
            <Button disabled={isLoading} onClick={() => deletePin()} variant={'danger'}>
              Confirm
            </Button>
          </FormGroup>
        </Form>
        {error instanceof Error ? <div>{error.message}</div> : null}
      </ListGroupItem>
    </ListGroup>
  )
}
