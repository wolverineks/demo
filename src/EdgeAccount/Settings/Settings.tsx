import React from 'react'
import { ListGroup, Tab, Tabs } from 'react-bootstrap'

import { Boundary } from '../../components'
import { Storage } from '../../Storage'
import { AutoLogout } from './AutoLogout'
import { Currencies } from './Currencies'
import { DefaultFiat } from './DefaultFiat'
import { OTP } from './OTP'
import { Password } from './Password'
import { Pin } from './Pin'
import { PinLogin } from './PinLogin'

export const Settings = () => {
  return (
    <Tabs id={'accountSettings'} defaultActiveKey={'account'}>
      <Tab title={'Account'} eventKey={'account'}>
        <ListGroup style={{ paddingTop: 4, paddingBottom: 4 }}>
          <Boundary>
            <OTP />
          </Boundary>

          <Boundary>
            <PinLogin />
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

          <Boundary>
            <Password />
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
