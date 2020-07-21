import { EdgeAccount } from 'edge-core-js'
import React from 'react'
import { Tab, Tabs } from 'react-bootstrap'

import { useSetAccount } from './AccountProvider'
import { CreateAccount } from './CreateAccount'
import { PasswordLogin } from './PasswordLogin'
import { PinLogin } from './PinLogin'

export const Login: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const setAccount = useSetAccount()
  const _onLogin = (account: EdgeAccount) => {
    setAccount(account)
    onLogin()
  }

  return (
    <Tabs id={'loginCreateAccountTabs'} defaultActiveKey={'login'} transition={false}>
      <Tab eventKey={'login'} title={'Login'}>
        <PasswordLogin onLogin={_onLogin} />
      </Tab>

      <Tab eventKey={'createAccount'} title={'Create Account'}>
        <CreateAccount onLogin={_onLogin} />
      </Tab>

      <Tab eventKey={'pinLogin'} title={'Pin Login'}>
        <PinLogin onLogin={_onLogin} />
      </Tab>
    </Tabs>
  )
}
