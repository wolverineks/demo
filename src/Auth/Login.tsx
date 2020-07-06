import * as React from 'react'
import { Tab, Tabs } from 'react-bootstrap'

import { CreateAccountForm } from './CreateAccountForm'
import { LoginForm } from './LoginForm'
import { PinLogin } from './PinLogin'

export const Login: React.FC<{ onLogin: () => any }> = ({ onLogin }) => {
  return (
    <Tabs id={'loginCreateAccountTabs'} defaultActiveKey={'login'} transition={false}>
      <Tab eventKey={'login'} title={'Login'}>
        <LoginForm onLogin={onLogin} />
      </Tab>

      <Tab eventKey={'createAccount'} title={'Create Account'}>
        <CreateAccountForm onLogin={onLogin} />
      </Tab>

      <Tab eventKey={'pinLogin'} title={'Pin Login'}>
        <PinLogin onLogin={onLogin} />
      </Tab>
    </Tabs>
  )
}
