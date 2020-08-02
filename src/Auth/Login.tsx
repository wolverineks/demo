import { EdgeAccount } from 'edge-core-js'
import React from 'react'
import { Tab, Tabs } from 'react-bootstrap'

import { Boundary } from '../components'
import { useEdgeContext } from '../Edge'
import { useSetAccount } from './AccountProvider'
import { CreateAccount } from './CreateAccount'
import { PasswordLogin } from './PasswordLogin'
import { PinLogin } from './PinLogin'

export const Login: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const context = useEdgeContext()
  const setAccount = useSetAccount()
  const _onLogin = (account: EdgeAccount) => {
    setAccount(account)
    onLogin()
  }

  return (
    <Tabs id={'loginCreateAccountTabs'} defaultActiveKey={'login'} transition={false}>
      <Tab eventKey={'login'} title={'Login'}>
        <Boundary>
          <PasswordLogin onLogin={_onLogin} context={context} />
        </Boundary>
      </Tab>

      <Tab eventKey={'createAccount'} title={'Create Account'}>
        <Boundary>
          <CreateAccount onLogin={_onLogin} context={context} />
        </Boundary>
      </Tab>

      <Tab eventKey={'pinLogin'} title={'Pin Login'}>
        <Boundary>
          <PinLogin onLogin={_onLogin} context={context} />
        </Boundary>
      </Tab>
    </Tabs>
  )
}
