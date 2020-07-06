import * as React from 'react'
import { Tab, Tabs } from 'react-bootstrap'

import { useAccount } from '../Auth'
import { Boundary } from '../Components/Boundary'
import { WalletInfo } from '../EdgeCurrencyWallet/WalletInfo'
import { useSelectWallet, useSelectedWallet } from '../SelectedWallet'
import { Settings } from '../Settings/Settings'
import { Storage } from '../Storage'
import { ActiveWalletList, ArchivedWalletList, DeletedWalletList } from '../WalletLists/'
import { CreateWallet } from './CreateWallet'

export const AccountInfo = () => {
  const account = useAccount()
  const [tab, setTab] = React.useState('wallets')
  const selectedWallet = useSelectedWallet()
  const selectWallet = useSelectWallet()

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
            <Boundary>
              <ActiveWalletList
                onSelect={(wallet) => {
                  selectWallet(wallet)
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
        <Boundary>{selectedWallet && <WalletInfo key={selectedWallet.id} wallet={selectedWallet} />}</Boundary>
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
