import { EdgeAccount } from 'edge-core-js'
import { useWatchAll } from 'edge-react-hooks'
import * as React from 'react'
import { Tab, Tabs } from 'react-bootstrap'
import { ErrorBoundary } from 'react-error-boundary'

import { Boundary } from '../Components/Boundary'
import { WalletInfo } from '../EdgeCurrencyWallet/WalletInfo'
import { useSelectWallet, useSelectedWallet } from '../SelectedWallet'
import { Settings } from '../Settings/Settings'
import { DataStore } from '../Storage/DataStore'
import { Disklet } from '../Storage/Disklet'
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
            <ErrorBoundary fallbackRender={({ error }) => <div>Error: {error?.message}</div>}>
              <React.Suspense fallback={<div>Loading Active Wallets...</div>}>
                <ActiveWalletList
                  account={account}
                  onSelect={(wallet) => {
                    selectWallet(wallet)
                    setTab('wallet')
                  }}
                />
              </React.Suspense>
            </ErrorBoundary>
          </Tab>

          <Tab eventKey={'archived'} title={'Archived'}>
            <React.Suspense fallback={<div>Loading Archived Wallets...</div>}>
              <ErrorBoundary fallbackRender={({ error }) => <div>Error: {error?.message}</div>}>
                <ArchivedWalletList account={account} />
              </ErrorBoundary>
            </React.Suspense>
          </Tab>

          <Tab eventKey={'deleted'} title={'Deleted'}>
            <React.Suspense fallback={<div>Loading Deleted Wallets...</div>}>
              <ErrorBoundary fallbackRender={({ error }) => <div>Error: {error?.message}</div>}>
                <DeletedWalletList account={account} />
              </ErrorBoundary>
            </React.Suspense>
          </Tab>

          <Tab eventKey={'create'} title={'Create'}>
            <ErrorBoundary fallbackRender={({ error }) => <div>Error: {error?.message}</div>}>
              <React.Suspense fallback={<div>Loading Create Wallet...</div>}>
                <CreateWallet account={account} key={account.activeWalletIds.length} />
              </React.Suspense>
            </ErrorBoundary>
          </Tab>
        </Tabs>
      </Tab>

      <Tab eventKey={'wallet'} title={'Wallet'}>
        <React.Suspense fallback={<div>Loading WalletInfo...</div>}>
          {selectedWallet && <WalletInfo key={selectedWallet.id} account={account} wallet={selectedWallet} />}
        </React.Suspense>
      </Tab>

      <Tab eventKey={'storage'} title={'Storage'}>
        <Boundary>
          <Disklet disklet={account.disklet} path={'/'} title={'Disklet'} />
          <Disklet disklet={account.localDisklet} path={'/'} title={'Local Disklet'} />
          <DataStore dataStore={account.dataStore} title={'DataStore'} />
        </Boundary>
      </Tab>

      <Tab eventKey={'settings'} title={'Settings'}>
        <React.Suspense fallback={<div>Loading Settings...</div>}>
          <Settings account={account} />
        </React.Suspense>
      </Tab>
    </Tabs>
  )
}
