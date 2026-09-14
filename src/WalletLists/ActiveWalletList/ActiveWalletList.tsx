import { EdgeCurrencyWallet } from 'edge-core-js'
import React from 'react'

import { useSelectWallet } from '../../App'
import { useEdgeAccount } from '../../auth'
import { Accordion, Balance, Boundary, ListGroup, Logo, ProgressBar } from '../../components'
import {
  useActiveWalletIds,
  useEdgeCurrencyWallet,
  useFiatCurrencyCode,
  useName,
  useOnNewTransactions,
  useSyncRatio,
  useTokens,
  useWatch,
} from '../../hooks'
import { normalize } from '../../utils'
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
              <Matcher walletId={id} searchQuery={searchQuery}>
                <ActiveWalletRow walletId={id} />
              </Matcher>
            </Boundary>
          ))}
        </ListGroup>
      </Accordion.Collapse>
    </Accordion>
  )
}

const Matcher: React.FC<{ walletId: string; searchQuery: string }> = ({ walletId, searchQuery, children }) => {
  const wallet = useEdgeCurrencyWallet({ account: useEdgeAccount(), walletId })
  const tokens = useTokens(wallet)
  const [name] = useName(wallet)
  const [fiatCurrencyCode] = useFiatCurrencyCode(wallet)

  const display = [name || '', wallet.currencyInfo.currencyCode, fiatCurrencyCode, ...tokens.enabled].some((target) =>
    normalize(target).includes(normalize(searchQuery)),
  )

  return display ? <>{children}</> : null
}

const ActiveWalletRow: React.FC<{ walletId: string }> = ({ walletId }) => {
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
  useWatch(wallet, 'balanceMap')
  const nativeBalance = wallet.balanceMap.get(null)
  const isSyncing = nativeBalance == null && syncRatio > 0 && syncRatio < 1

  return isSyncing ? <ProgressBar min={0} now={syncRatio} max={1} striped animated /> : null
}
