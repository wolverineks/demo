import { EdgeCurrencyWallet } from 'edge-core-js'
import React from 'react'
import { Tab, Tabs } from 'react-bootstrap'

import { Boundary, DisplayAmount } from '../components'
import { FiatAmount } from '../Fiat'
import { useBalance, useFiatCurrencyCode, useOnNewTransactions } from '../hooks'
import { Disklet } from '../Storage'
import { Request } from './Request'
import { Send } from './Send'
import { Settings } from './Settings'
import { TransactionList } from './TransactionList'

const Balance: React.FC<{ wallet: EdgeCurrencyWallet; currencyCode: string }> = ({ wallet, currencyCode }) => {
  const balance = useBalance(wallet, currencyCode)
  const fiatCurrencyCode = useFiatCurrencyCode(wallet)[0]

  return (
    <div>
      <div>
        <DisplayAmount nativeAmount={balance} currencyCode={currencyCode} />
      </div>

      <div>
        <FiatAmount nativeAmount={balance} fromCurrencyCode={currencyCode} fiatCurrencyCode={fiatCurrencyCode} />
      </div>
    </div>
  )
}

export const WalletInfo: React.FC<{ wallet: EdgeCurrencyWallet; currencyCode: string }> = ({
  wallet,
  currencyCode,
}) => {
  useOnNewTransactions(
    wallet,
    (transactions) => transactions && alert(transactions.length > 1 ? 'New Transactions' : 'New Transaction'),
  )

  return (
    <Tabs id={'walletTabs'} defaultActiveKey={'history'}>
      <Tab eventKey={'history'} title={'History'}>
        <Boundary>
          <Balance wallet={wallet} currencyCode={currencyCode} />
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
          <Disklets wallet={wallet} />
        </Boundary>
      </Tab>
    </Tabs>
  )
}

const Disklets = ({ wallet }: { wallet: EdgeCurrencyWallet }) => {
  return (
    <React.Fragment key={wallet.id}>
      <Disklet id={[wallet.id, 'localDisklet']} title={'Local Storage'} disklet={wallet.localDisklet} />
      <Disklet id={[wallet.id, 'disklet']} title={'Synced Storage'} disklet={wallet.disklet} />
    </React.Fragment>
  )
}
