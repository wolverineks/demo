import { EdgeCurrencyWallet } from 'edge-core-js'
import React from 'react'
import { Tab, Tabs } from 'react-bootstrap'

import { Boundary } from '../components'
import { useOnNewTransactions } from '../hooks'
import { Disklet } from '../Storage'
import { Request } from './Request'
import { Send } from './Send'
import { Settings } from './Settings'
import { TransactionList } from './TransactionList'

export const WalletInfo: React.FC<{ wallet: EdgeCurrencyWallet; currencyCode: string }> = ({
  wallet,
  currencyCode,
}) => {
  useOnNewTransactions(
    wallet,
    (transactions) => transactions && alert(transactions.length > 1 ? 'New Transactions' : 'New Transaction'),
  )

  return (
    <Tabs id={'walletTabs'} defaultActiveKey={'history'} mountOnEnter>
      <Tab eventKey={'history'} title={'History'}>
        <Boundary>
          <TransactionList wallet={wallet} currencyCode={currencyCode} />
        </Boundary>
      </Tab>

      <Tab eventKey={'send'} title={'Send'}>
        <Boundary>
          <Send wallet={wallet} currencyCode={currencyCode} />
        </Boundary>
      </Tab>

      <Tab eventKey={'request'} title={'Request'}>
        <Boundary>
          <Request wallet={wallet} currencyCode={currencyCode} />
        </Boundary>
      </Tab>

      <Tab eventKey={'settings'} title={'Settings'}>
        <Boundary>
          <Settings wallet={wallet} key={wallet.id} />
        </Boundary>
      </Tab>

      <Tab eventKey={'storage'} title={'Storage'}>
        <Boundary>
          <Disklets wallet={wallet} key={wallet.id} />
        </Boundary>
      </Tab>
    </Tabs>
  )
}

const Disklets = ({ wallet }: { wallet: EdgeCurrencyWallet }) => {
  return (
    <React.Fragment>
      <Disklet id={[wallet.id, 'localDisklet']} title={'Local Storage'} disklet={wallet.localDisklet} />
      <Disklet id={[wallet.id, 'disklet']} title={'Synced Storage'} disklet={wallet.disklet} />
    </React.Fragment>
  )
}
