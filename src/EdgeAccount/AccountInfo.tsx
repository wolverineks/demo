import * as React from 'react'
import { Tab, Tabs } from 'react-bootstrap'

import { useAccount } from '../auth'
import { Boundary } from '../components'
import { WalletInfo } from '../EdgeCurrencyWallet/WalletInfo'
import { fallbackRender, useSelectWallet } from '../SelectedWallet'
import { Settings } from '../Settings/Settings'
import { Storage } from '../Storage'
import { ActiveWalletList, ArchivedWalletList, DeletedWalletList } from '../WalletLists/'
import { CreateWallet } from './CreateWallet'

export const onRender = (
  id: string, // the "id" prop of the Profiler tree that has just committed
  _phase: 'mount' | 'update', // either "mount" (if the tree just mounted) or "update" (if it re-rendered)
  actualDuration: number, // time spent rendering the committed update
  baseDuration: number, // estimated time to render the entire subtree without memoization
  _startTime: number, // when React began rendering this update
  _commitTime: number, // when React committed this update
  _interactions: any, // the Set of interactions belonging to this update
) => {
  console.log('profile', id, { actualDuration, baseDuration })
}

export const AccountInfo = () => {
  const account = useAccount()
  const [tab, setTab] = React.useState('wallets')
  const selectWallet = useSelectWallet()

  console.log(
    'qwe',
    'activeWallets',
    'ids',
    account.activeWalletIds.length,
    'wallets',
    Object.keys(account.currencyWallets).length,
  )

  return (
    <Tabs
      id={'accountTabs'}
      defaultActiveKey={'wallets'}
      activeKey={tab}
      onSelect={(tab: any) => setTab(tab || 'wallets')}
      transition={false}
    >
      <Tab eventKey={'wallets'} title={'Wallets'}>
        <Tabs variant={'pills'} id={'walletLists'} defaultActiveKey={'active'} transition={false}>
          <Tab eventKey={'active'} title={'Active'}>
            <Boundary error={{ fallbackRender }}>
              <ActiveWalletList
                onSelect={(walletId: string) => {
                  selectWallet(walletId)
                  setTab('wallet')
                }}
              />
            </Boundary>
          </Tab>

          <Tab eventKey={'archived'} title={'Archived'}>
            <Boundary>
              <ArchivedWalletList />
            </Boundary>
          </Tab>

          <Tab eventKey={'deleted'} title={'Deleted'}>
            <Boundary>
              <DeletedWalletList />
            </Boundary>
          </Tab>

          <Tab eventKey={'create'} title={'Create'}>
            <Boundary>
              <CreateWallet key={account.activeWalletIds.length} />
            </Boundary>
          </Tab>
        </Tabs>
      </Tab>

      <Tab eventKey={'wallet'} title={'Wallet'}>
        <Boundary error={{ fallbackRender }}>
          <WalletInfo />
        </Boundary>
      </Tab>

      <Tab eventKey={'storage'} title={'Storage'}>
        <Boundary>
          <Storage />
        </Boundary>
      </Tab>

      <Tab eventKey={'settings'} title={'Settings'}>
        <Boundary>
          <Settings />
        </Boundary>
      </Tab>
    </Tabs>
  )
}
