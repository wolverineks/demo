import React from 'react'
import { Tab, Tabs } from 'react-bootstrap'

import { useAccount } from '../auth'
import { Boundary } from '../components'
import { WalletInfo } from '../EdgeCurrencyWallet/WalletInfo'
import { useActiveWalletIds } from '../hooks'
import { fallbackRender, useSelectWallet, useSelectedWallet } from '../SelectedWallet'
import { Settings } from '../Settings/Settings'
import { Storage } from '../Storage'
import { ActiveWalletList, ArchivedWalletList, DeletedWalletList } from '../WalletLists/'
import { CreateWallet } from './CreateWallet'

export const AccountInfo = () => {
  const [tab, setTab] = React.useState('wallets')
  const selectWallet = useSelectWallet()
  const selectedWallet = useSelectedWallet()
  const activeWalletIds = useActiveWalletIds(useAccount())

  return (
    <Tabs
      id={'accountTabs'}
      defaultActiveKey={'wallets'}
      activeKey={tab}
      onSelect={(tab) => tab && setTab(tab)}
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
              <CreateWallet key={activeWalletIds.length} />
            </Boundary>
          </Tab>
        </Tabs>
      </Tab>

      <Tab eventKey={'wallet'} title={'Wallet'}>
        {selectedWallet ? (
          <Boundary>
            <WalletInfo wallet={selectedWallet} />
          </Boundary>
        ) : (
          <div>No SelectedWallet</div>
        )}
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
