/* eslint-disable react/display-name */
import React from 'react'
import { ListGroup, Tab, Tabs } from 'react-bootstrap'

import { AutoLogout } from '../AutoLogout'
import { Boundary } from '../components'
import { DefaultFiat } from '../Fiat'
import { OTP } from '../OTP'
import { PinLogin } from '../PinLogin'
import { useSearchQuery } from '../search'
import { Currencies } from './Currencies'

export const Settings = () => {
  const searchQuery = useSearchQuery()

  return (
    <Tabs id={'accountSettings'} defaultActiveKey={'account'}>
      <Tab title={'Account'} eventKey={'account'}>
        <ListGroup style={{ paddingTop: 4, paddingBottom: 4 }}>
          <Boundary
            error={{ fallbackRender: ({ error }) => <div>Error: {error?.message}</div> }}
            suspense={{ fallback: <div>OTP loading...</div> }}
          >
            <OTP />
          </Boundary>

          <Boundary
            error={{ fallbackRender: ({ error }) => <div>Error: {error?.message}</div> }}
            suspense={{ fallback: <div>AutoLogout loading...</div> }}
          >
            <AutoLogout />
          </Boundary>

          <Boundary
            error={{ fallbackRender: ({ error }) => <div>Error: {error?.message}</div> }}
            suspense={{ fallback: <div>Default Fiat loading...</div> }}
          >
            <DefaultFiat />
          </Boundary>

          <Boundary
            error={{ fallbackRender: ({ error }) => <div>Error: {error?.message}</div> }}
            suspense={{ fallback: <div>PinLogin loading...</div> }}
          >
            <PinLogin />
          </Boundary>
        </ListGroup>
      </Tab>

      <Tab eventKey={'currencies'} title={'Currencies'}>
        <Boundary
          error={{ fallbackRender: ({ error }) => <div>Error: {error?.message}</div> }}
          suspense={{ fallback: <div>Currencies loading...</div> }}
        >
          <Currencies query={searchQuery} />
        </Boundary>
      </Tab>
    </Tabs>
  )
}
