import { EdgeCurrencyWallet } from 'edge-core-js'
import React from 'react'
import { Accordion, ListGroup, ProgressBar } from 'react-bootstrap'

import { useEdgeAccount } from '../../auth'
import { Balance, Boundary, Logo } from '../../components'
import {
  useActiveWalletIds,
  useEdgeCurrencyWallet,
  useEnabledTokens,
  useFiatCurrencyCode,
  useName,
  useOnNewTransactions,
  useSyncRatio,
} from '../../hooks'
import { useSelectedWalletInfo } from '../../SelectedWallet'
import { normalize } from '../../utils'
import { EnabledTokens } from './EnabledTokens'
import { WalletOptions } from './WalletOptions'

export const ActiveWalletList: React.FC<{ onSelect: () => void; searchQuery: string }> = ({
  onSelect,
  searchQuery,
}) => {
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
                <ActiveWalletRow walletId={id} onSelect={onSelect} />
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
  const enabledTokens = useEnabledTokens(wallet)
  const [name] = useName(wallet)
  const [fiatCurrencyCode] = useFiatCurrencyCode(wallet)

  const display = [name || '', wallet.currencyInfo.currencyCode, fiatCurrencyCode, ...enabledTokens].some((target) =>
    normalize(target).includes(normalize(searchQuery)),
  )

  return display ? <>{children}</> : null
}

const ActiveWalletRow: React.FC<{ walletId: string; onSelect: () => void }> = ({ walletId, onSelect }) => {
  const account = useEdgeAccount()
  const wallet = useEdgeCurrencyWallet({ account, walletId })
  const [name] = useName(wallet)
  const currencyCode = wallet.currencyInfo.currencyCode
  const [selected, select] = useSelectedWalletInfo()

  useOnNewTransactions(wallet, (transactions) =>
    alert(`${name} - ${transactions.length > 1 ? 'New Transactions' : 'New Transaction'}`),
  )

  return (
    <>
      <ListGroup.Item
        variant={wallet.id === selected?.id && currencyCode === selected?.currencyCode ? 'primary' : undefined}
      >
        <SyncRatio wallet={wallet} />
        <span
          onClick={() => {
            select({ id: walletId, currencyCode })
            onSelect()
          }}
          className={'float-left'}
        >
          <Logo currencyCode={currencyCode} /> {name}{' '}
          <Boundary>
            <Balance wallet={wallet} currencyCode={currencyCode} />
          </Boundary>
        </span>

        <WalletOptions walletId={wallet.id} />
      </ListGroup.Item>

      <EnabledTokens wallet={wallet} onSelect={onSelect} />
    </>
  )
}

const SyncRatio = ({ wallet }: { wallet: EdgeCurrencyWallet }) => {
  const syncRatio = useSyncRatio(wallet)

  return syncRatio < 1 ? <ProgressBar min={0} now={Math.max(syncRatio, 0.1)} max={1} striped animated /> : null
}