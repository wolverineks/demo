import { EdgeCurrencyWallet, EdgeTokenId } from 'edge-core-js'
import React from 'react'
import { useQueryClient } from 'react-query'

import { Boundary, Tab, Tabs } from '../components'
import { fetchReceiveAddressAndUri, receiveAddressQueryKey, useOnNewTransactions } from '../hooks'
import { Disklet } from '../Storage'
import { Request } from './Request'
import { Send } from './Send'
import { Settings } from './Settings'
import { TransactionList } from './TransactionList'

export const WalletInfo: React.FC<{ wallet: EdgeCurrencyWallet; tokenId: EdgeTokenId }> = ({ wallet, tokenId }) => {
  const queryClient = useQueryClient()
  const tokenIdKey = `${wallet.id}:${tokenId ?? 'native'}`

  useOnNewTransactions(
    wallet,
    (transactions) => transactions && alert(transactions.length > 1 ? 'New Transactions' : 'New Transaction'),
  )

  React.useEffect(() => {
    const nativeAmount = '0'
    const options = { tokenId }
    queryClient.prefetchQuery({
      queryKey: receiveAddressQueryKey(wallet.id, nativeAmount, options),
      queryFn: () => fetchReceiveAddressAndUri({ wallet, nativeAmount, options }),
      staleTime: Infinity,
    })
  }, [queryClient, tokenId, wallet])

  return (
    <Tabs id={'walletTabs'} defaultActiveKey={'history'} mountOnEnter unmountOnExit>
      <Tab eventKey={'history'} title={'History'}>
        <Boundary>
          <TransactionList wallet={wallet} tokenId={tokenId} key={tokenIdKey} />
        </Boundary>
      </Tab>

      <Tab eventKey={'send'} title={'Send'}>
        <Boundary>
          <Send wallet={wallet} tokenId={tokenId} key={tokenIdKey} />
        </Boundary>
      </Tab>

      <Tab eventKey={'request'} title={'Request'}>
        <Boundary>
          <Request wallet={wallet} tokenId={tokenId} key={tokenIdKey} />
        </Boundary>
      </Tab>

      <Tab eventKey={'settings'} title={'Settings'}>
        <Boundary>
          <Settings wallet={wallet} key={tokenIdKey} />
        </Boundary>
      </Tab>

      <Tab eventKey={'storage'} title={'Storage'}>
        <Boundary>
          <Disklets wallet={wallet} key={tokenIdKey} />
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
