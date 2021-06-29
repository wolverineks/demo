import { EdgeCurrencyWallet, EdgeTransaction } from 'edge-core-js'
import React from 'react'

import { useEdgeAccount } from '../../auth'
import { Button, DisplayAmount, FormControl, Image, ListGroup, NavLink, Row } from '../../components'
import {
  useAddressExplorerUrl,
  useBlockExplorerUrl,
  useTransactionCount,
  useTransactionExplorerUrl,
  useTransactions,
} from '../../hooks'
import { normalize } from '../../utils'
import { useFilter } from '../useFilter'
import { ExportTransactions } from './ExportTransactions'
import { Metadata } from './Metadata'

export const TransactionList: React.FC<{ wallet: EdgeCurrencyWallet; currencyCode: string }> = ({
  wallet,
  currencyCode,
}) => {
  const transactionCount = useTransactionCount(wallet, { currencyCode })
  const [transactions, setFilterQuery] = useFilter(matches, useTransactions(wallet, { currencyCode }))
  const [isActive, setIsActive] = React.useState(false)

  return (
    <ListGroup>
      <Row style={{ justifyContent: 'space-between' }}>
        Transactions: {transactionCount} ({transactions.length})
        <Button onClick={() => setIsActive((x) => !x)}>
          <Image alt={'logo'} src={'../../export.png'} style={{ height: 40, width: 40 }} />
        </Button>
      </Row>

      <Row>
        <ExportTransactions wallet={wallet} currencyCode={currencyCode} isActive={isActive} />
      </Row>

      <Row>
        <FormControl placeholder={'Search'} onChange={(event) => setFilterQuery(event.currentTarget.value)} />
      </Row>

      <Row>
        {transactions.length <= 0 ? (
          <div>No Transactions</div>
        ) : (
          transactions.map((transaction) => <TransactionListRow transaction={transaction} key={transaction.txid} />)
        )}
      </Row>
    </ListGroup>
  )
}

const TransactionListRow: React.FC<{ transaction: EdgeTransaction }> = ({ transaction }) => {
  const account = useEdgeAccount()
  const transactionExplorerUrl = useTransactionExplorerUrl(account, transaction)
  const addressExplorerUrl = useAddressExplorerUrl(account, transaction)
  const blockExplorerUrl = useBlockExplorerUrl(account, transaction)

  return (
    <ListGroup.Item
      style={{ flex: 1 }}
      id={transaction.txid}
      variant={transaction.nativeAmount.startsWith('-') ? 'danger' : 'info'}
    >
      <span>
        <DisplayDate transaction={transaction} />:{' '}
        <DisplayAmount nativeAmount={transaction.nativeAmount} currencyCode={transaction.currencyCode} />{' '}
        {transaction.txid}
      </span>

      {transaction.metadata && <Metadata metadata={transaction.metadata} />}

      {transactionExplorerUrl ? (
        <NavLink target={'none'} href={transactionExplorerUrl}>
          View Transaction Details
        </NavLink>
      ) : null}

      {addressExplorerUrl ? (
        <NavLink target={'none'} href={addressExplorerUrl}>
          View Address Details
        </NavLink>
      ) : null}

      {blockExplorerUrl ? (
        <NavLink target={'none'} href={blockExplorerUrl}>
          View Block Details
        </NavLink>
      ) : null}
    </ListGroup.Item>
  )
}

const DisplayDate: React.FC<{ transaction: EdgeTransaction }> = ({ transaction }) => {
  const dateInMs = transaction.date * 1000
  const date = new Date(dateInMs)
  const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })

  return <>{formattedDate}</>
}

const matches =
  (query: string) =>
  (transaction: EdgeTransaction): boolean => {
    const normalizedQuery = normalize(query)

    return (
      transaction.txid.includes(query) ||
      normalize(new Date(transaction.date * 1000).toLocaleString()).includes(normalizedQuery) ||
      normalize(transaction.currencyCode).includes(normalizedQuery) ||
      normalize(transaction.nativeAmount).includes(normalizedQuery) ||
      normalize(transaction.metadata?.name || '').includes(normalizedQuery) ||
      normalize(transaction.metadata?.category || '').includes(normalizedQuery) ||
      normalize(transaction.metadata?.notes || '').includes(normalizedQuery) ||
      normalize(String(transaction.metadata?.amountFiat) || '').includes(normalizedQuery)
    )
  }
