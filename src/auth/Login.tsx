import { EdgeAccount } from 'edge-core-js'
import React from 'react'

import { Boundary, Tab, Tabs } from '../components'
import { useSetAccount } from './AccountProvider'
import { CreateAccount } from './CreateAccount'
import { PasswordLogin } from './PasswordLogin'
import { PinLogin } from './PinLogin'

export const Login = () => {
  const setAccount = useSetAccount()
  const onLogin = (account: EdgeAccount) => setAccount(account)

  return (
    <Tabs id={'loginCreateAccountTabs'} defaultActiveKey={'login'}>
      <Tab eventKey={'login'} title={'Login'}>
        <Boundary>
          <PasswordLogin onLogin={onLogin} />
        </Boundary>
      </Tab>

      <Tab eventKey={'createAccount'} title={'Create Account'}>
        <Boundary>
          <CreateAccount onLogin={onLogin} />
        </Boundary>
      </Tab>

      <Tab eventKey={'pinLogin'} title={'Pin Login'}>
        <Boundary>
          <PinLogin onLogin={onLogin} />
        </Boundary>
      </Tab>
    </Tabs>
  )
}
