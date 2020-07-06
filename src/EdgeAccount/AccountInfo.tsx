import { EdgeAccount } from 'edge-core-js'
import { useWatchAll } from 'edge-react-hooks'
import * as React from 'react'
import { Tab, Tabs } from 'react-bootstrap'

import { Boundary } from '../Components/Boundary'
import { WalletInfo } from '../EdgeCurrencyWallet/WalletInfo'
import { useSelectWallet, useSelectedWallet } from '../SelectedWallet'
import { Settings } from '../Settings/Settings'
import { Storage } from '../Storage'
import { ActiveWalletList, ArchivedWalletList, DeletedWalletList } from '../WalletLists/'
import { CreateWallet } from './CreateWallet'

export const AccountInfo = ({ account }: { account: EdgeAccount }) => {
  useWatchAll(account)

  const [tab, setTab] = React.useState('wallets')
  const selectedWallet = useSelectedWallet({ account })
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
                account={account}
                onSelect={(wallet) => {
                  selectWallet(wallet)
                  setTab('wallet')
                }}
              />
            </Boundary>
          </Tab>

          <Tab eventKey={'archived'} title={'Archived'}>
            <Boundary>
              <ArchivedWalletList account={account} />
            </Boundary>
          </Tab>

          <Tab eventKey={'deleted'} title={'Deleted'}>
            <Boundary>
              <DeletedWalletList account={account} />
            </Boundary>
          </Tab>

          <Tab eventKey={'create'} title={'Create'}>
            <Boundary>
              <CreateWallet account={account} key={account.activeWalletIds.length} />
            </Boundary>
          </Tab>
        </Tabs>
      </Tab>

      <Tab eventKey={'wallet'} title={'Wallet'}>
        <Boundary>
          {selectedWallet && <WalletInfo key={selectedWallet.id} account={account} wallet={selectedWallet} />}
        </Boundary>
      </Tab>

      <Tab eventKey={'storage'} title={'Storage'}>
        <Boundary>
          <Storage account={account} />
        </Boundary>
      </Tab>

      <Tab eventKey={'settings'} title={'Settings'}>
        <Boundary>
          <Settings account={account} />
        </Boundary>
      </Tab>
    </Tabs>
  )
}
