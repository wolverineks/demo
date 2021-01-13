import React from 'react'
import { Button, Form, FormGroup, ListGroup, ListGroupItem } from 'react-bootstrap'

import { useEdgeAccount } from '../auth'
import { useEdgeContext } from '../Edge'
import { usePin } from '../hooks'

export const Pin = () => {
  return (
    <>
      <CheckPin />
      <ChangePin />
      <EnablePinLogin />
    </>
  )
}

const CheckPin = () => {
  const context = useEdgeContext()
  const account = useEdgeAccount()
  const {
    checkPin: { mutate: checkPin, data: isCorrect, error, reset, isLoading },
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
        Check Pin
        <Form
          id={`checkPin`}
          onSubmit={(event: React.FormEvent) => {
            event.preventDefault()
            setPin('')
            checkPin(pin)
          }}
        >
          <FormGroup>
            <Form.Row>
              <Form.Control
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
        Change Pin
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

const EnablePinLogin = () => {
  const context = useEdgeContext()
  const account = useEdgeAccount()
  const {
    pinExists,
    pinLoginEnabled,
    changePinLogin: { mutate: changePinLogin, error, isLoading },
  } = usePin(context, account)

  return (
    <ListGroup style={{ paddingTop: 4, paddingBottom: 4 }}>
      <ListGroupItem>
        Pin Login: {String(pinLoginEnabled)}
        <Form>
          <FormGroup>
            <Form.Check
              type={'switch'}
              checked={pinLoginEnabled}
              label={'Enabled'}
              id={'pinLoginEnabled'}
              onChange={() => changePinLogin(!pinLoginEnabled)}
              disabled={!pinExists || isLoading}
            />
          </FormGroup>
        </Form>
        {error instanceof Error ? <div>{error.message}</div> : null}
      </ListGroupItem>
    </ListGroup>
  )
}
