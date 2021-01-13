/* eslint-disable react/display-name */
import React from 'react'
import { ListGroup, Tab, Tabs } from 'react-bootstrap'

import { AutoLogout } from '../AutoLogout'
import { Boundary } from '../components'
import { DefaultFiat } from '../Fiat'
import { OTP } from '../OTP'
import { Pin } from '../Pin'
import { Storage } from '../Storage'
import { Currencies } from './Currencies'

export const Settings = () => {
  return (
    <Tabs id={'accountSettings'} defaultActiveKey={'account'}>
      <Tab title={'Account'} eventKey={'account'}>
        <ListGroup style={{ paddingTop: 4, paddingBottom: 4 }}>
          <Boundary>
            <OTP />
          </Boundary>

          <Boundary>
            <AutoLogout />
          </Boundary>

          <Boundary>
            <DefaultFiat />
          </Boundary>

          <Boundary>
            <Pin />
          </Boundary>
        </ListGroup>
      </Tab>

      <Tab eventKey={'currencies'} title={'Currencies'}>
        <Boundary>
          <Currencies />
        </Boundary>
      </Tab>

      <Tab eventKey={'storage'} title={'Storage'}>
        <Boundary>
          <Storage />
        </Boundary>
      </Tab>
    </Tabs>
  )
}
