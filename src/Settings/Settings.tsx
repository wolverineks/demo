/* eslint-disable react/display-name */
import React from 'react'
import { FormControl, ListGroup } from 'react-bootstrap'

import { AutoLogout } from '../AutoLogout'
import { Boundary } from '../components'
import { DefaultFiat } from '../Fiat'
import { OTP } from '../OTP'
import { PinLogin } from '../PinLogin'
import { Currencies } from './Currencies'

const normalize = (text: string) => text.trim().toLowerCase()

const matches = (query: string, target: string) => normalize(target).includes(normalize(query))

export const Settings = () => {
  const [query, setQuery] = React.useState('')

  return (
    <ListGroup style={{ paddingTop: 4, paddingBottom: 4 }}>
      <FormControl placeholder={'Search'} onChange={(event) => setQuery(event.currentTarget.value)} />

      <Matcher query={query} match={'otp'}>
        <Boundary
          error={{ fallbackRender: ({ error }) => <div>Error: {error?.message}</div> }}
          suspense={{ fallback: <div>OTP loading...</div> }}
        >
          <OTP />
        </Boundary>
      </Matcher>

      <Matcher query={query} match="autologout">
        <Boundary
          error={{ fallbackRender: ({ error }) => <div>Error: {error?.message}</div> }}
          suspense={{ fallback: <div>AutoLogout loading...</div> }}
        >
          <AutoLogout />
        </Boundary>
      </Matcher>

      <Matcher query={query} match="default fiat">
        <Boundary
          error={{ fallbackRender: ({ error }) => <div>Error: {error?.message}</div> }}
          suspense={{ fallback: <div>Default Fiat loading...</div> }}
        >
          <DefaultFiat />
        </Boundary>
      </Matcher>

      <Matcher query={query} match="pinLogin">
        <Boundary
          error={{ fallbackRender: ({ error }) => <div>Error: {error?.message}</div> }}
          suspense={{ fallback: <div>PinLogin loading...</div> }}
        >
          <PinLogin />
        </Boundary>
      </Matcher>

      <Boundary
        error={{ fallbackRender: ({ error }) => <div>Error: {error?.message}</div> }}
        suspense={{ fallback: <div>Currencies loading...</div> }}
      >
        <Currencies query={query} />
      </Boundary>
    </ListGroup>
  )
}

const Matcher: React.FC<{ query: string; match: string }> = ({ children, query, match }) => (
  <>{matches(query, match) ? children : null}</>
)
