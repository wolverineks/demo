import { EdgeCurrencyWallet } from 'edge-core-js'
import React from 'react'
import { useQuery } from 'react-query'

import { useSelectWallet } from '../../App'
import { useEdgeAccount } from '../../auth'
import { Accordion, Balance, Boundary, ListGroup, Logo, ProgressBar } from '../../components'
import {
  useActiveWalletIds,
  useEdgeCurrencyWallet,
  useName,
  useOnNewTransactions,
  useSyncRatio,
} from '../../hooks'
import { getWalletListMeta, normalize } from '../../utils'
import { EnabledTokens } from './EnabledTokens'
import { WalletOptions } from './WalletOptions'

export const ActiveWalletList: React.FC<{ searchQuery: string }> = ({ searchQuery }) => {
  const account = useEdgeAccount()
  const activeWalletIds = useActiveWalletIds(account)

  return (
    <Accordion defaultActiveKey={'0'}>
      <Accordion.Toggle as={ListGroup.Item} eventKey={'0'}>
        Active Wallets ({activeWalletIds.length})
      </Accordion.Toggle>

      <Accordion.Collapse eventKey={'0'}>
        <ListGroup variant={'flush'}>
          {activeWalletIds.map((id) => (
            <Boundary key={id} suspense={{ fallback: <ListGroup.Item>Loading...</ListGroup.Item> }}>
              {searchQuery ? (
                <Matcher walletId={id} searchQuery={searchQuery}>
                  <ActiveWalletRow walletId={id} />
                </Matcher>
              ) : (
                <ActiveWalletRow walletId={id} />
              )}
            </Boundary>
          ))}
        </ListGroup>
      </Accordion.Collapse>
    </Accordion>
  )
}

const Matcher: React.FC<{ walletId: string; searchQuery: string }> = ({ walletId, searchQuery, children }) => {
  const account = useEdgeAccount()
  const meta = getWalletListMeta(account, walletId)
  const snapshot = useWalletSnapshot(account, walletId)
  const name = snapshot?.name || meta.name
  const currencyCode = snapshot?.currencyInfo?.currencyCode || meta.currencyCode
  const fiatCurrencyCode = snapshot?.fiatCurrencyCode
  const display = [name, currencyCode, fiatCurrencyCode].some(
    (target) => !!target && normalize(target).includes(normalize(searchQuery)),
  )

  return display ? <>{children}</> : null
}

const ActiveWalletRow: React.FC<{ walletId: string }> = ({ walletId }) => {
  const [selected, select] = useSelectWallet()
  const isSelected = selected?.id === walletId

  return isSelected ? <LiveActiveWalletRow walletId={walletId} /> : <IdleActiveWalletRow walletId={walletId} />
}

const IdleActiveWalletRow: React.FC<{ walletId: string }> = ({ walletId }) => {
  const account = useEdgeAccount()
  const meta = getWalletListMeta(account, walletId)
  const snapshot = useWalletSnapshot(account, walletId)
  const [, select] = useSelectWallet()
  const currencyCode = snapshot?.currencyInfo?.currencyCode || meta.currencyCode
  const name = snapshot?.name || meta.name

  return (
    <ListGroup.Item className="wallet-row">
      <div className="wallet-row__body">
        <div className="wallet-row__main" onClick={() => select({ id: walletId, currencyCode })}>
          <Logo currencyCode={currencyCode} pluginId={meta.pluginId} />
          <div className="wallet-row__text">
            <div className="wallet-row__name">{name}</div>
            <div className="wallet-row__balance">{snapshot ? 'Saved balance' : 'Tap to load'}</div>
          </div>
        </div>

        <WalletOptions walletId={walletId} />
      </div>
    </ListGroup.Item>
  )
}

const LiveActiveWalletRow: React.FC<{ walletId: string }> = ({ walletId }) => {
  const account = useEdgeAccount()
  const wallet = useEdgeCurrencyWallet({ account, walletId })
  const [name] = useName(wallet)
  const currencyCode = wallet.currencyInfo.currencyCode
  const [selected, select] = useSelectWallet()

  useOnNewTransactions(wallet, (transactions) =>
    alert(`${name} - ${transactions.length > 1 ? 'New Transactions' : 'New Transaction'}`),
  )

  return (
    <>
      <ListGroup.Item
        className="wallet-row"
        variant={wallet.id === selected?.id && currencyCode === selected?.currencyCode ? 'primary' : undefined}
      >
        <SyncRatio wallet={wallet} />
        <div className="wallet-row__body">
          <div className="wallet-row__main" onClick={() => select({ id: walletId, currencyCode })}>
            <Logo currencyCode={currencyCode} />
            <div className="wallet-row__text">
              <div className="wallet-row__name">{name || currencyCode}</div>
              <div className="wallet-row__balance">
                <Boundary>
                  <Balance wallet={wallet} currencyCode={currencyCode} />
                </Boundary>
              </div>
            </div>
          </div>

          <WalletOptions walletId={wallet.id} />
        </div>
      </ListGroup.Item>

      <EnabledTokens wallet={wallet} />
    </>
  )
}

const SyncRatio = ({ wallet }: { wallet: EdgeCurrencyWallet }) => {
  const syncRatio = useSyncRatio(wallet)
  const isSyncing = syncRatio > 0 && syncRatio < 1

  return isSyncing ? <ProgressBar min={0} now={syncRatio} max={1} striped animated /> : null
}

const useWalletSnapshot = (account: ReturnType<typeof useEdgeAccount>, walletId: string) => {
  return useQuery({
    queryKey: ['snapshot', walletId],
    queryFn: () =>
      account.dataStore
        .getItem('snapshot', walletId)
        .then(JSON.parse)
        .catch(() => undefined),
    suspense: false,
    retry: false,
  }).data as { name?: string; currencyInfo?: { currencyCode: string }; fiatCurrencyCode?: string } | undefined
}
