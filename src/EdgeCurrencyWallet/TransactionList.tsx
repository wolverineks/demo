import { EdgeCurrencyWallet, EdgeTransaction } from 'edge-core-js'
import React from 'react'
import { FormControl, ListGroup, NavLink } from 'react-bootstrap'

import { useEdgeAccount } from '../auth'
import { Boundary, DisplayAmount } from '../components'
import { useDisplayDenomination, useTransactionCount, useTransactions } from '../hooks'
import {
  exchangeToNative,
  getAddressExplorerUrl,
  getBlockExplorerUrl,
  getTransactionExplorerUrl,
  getXpubExplorerUrl,
  nativeToDenominated,
} from '../utils'
import { useFilter } from './useFilter'

const matches = (query: string) => (transaction: EdgeTransaction): boolean => {
  const normalize = (text: string) => text.trim().toLowerCase()

  return (
    transaction.txid.includes(query) ||
    normalize(new Date(transaction.date * 1000).toLocaleString()).includes(normalize(query)) ||
    normalize(transaction.currencyCode).includes(normalize(query)) ||
    normalize(transaction.nativeAmount).includes(normalize(query)) ||
    normalize(transaction.metadata?.name || '').includes(normalize(query)) ||
    normalize(transaction.metadata?.category || '').includes(normalize(query)) ||
    normalize(transaction.metadata?.notes || '').includes(normalize(query)) ||
    normalize(String(transaction.metadata?.amountFiat) || '').includes(normalize(query))
  )
}

export const TransactionList: React.FC<{ wallet: EdgeCurrencyWallet; currencyCode: string }> = ({
  wallet,
  currencyCode,
}) => {
  const transactionCount = useTransactionCount(wallet, { currencyCode })
  const [transactions, setFilterQuery] = useFilter(matches, useTransactions(wallet, { currencyCode }))

  return (
    <ListGroup>
      <ListGroup>
        Transactions: {transactionCount} ({transactions.length})
        <FormControl placeholder={'Search'} onChange={(event) => setFilterQuery(event.currentTarget.value)} />
        {transactions.length <= 0 ? (
          <div>No Transactions</div>
        ) : (
          transactions.map((transaction) => <TransactionListRow transaction={transaction} key={transaction.txid} />)
        )}
      </ListGroup>
    </ListGroup>
  )
}

const TransactionListRow: React.FC<{ transaction: EdgeTransaction }> = ({ transaction }) => {
  const account = useEdgeAccount()
  const transactionExplorerUrl = getTransactionExplorerUrl(account, transaction)
  const addressExplorerUrl = getAddressExplorerUrl(account, transaction)
  const xPubExplorerUrl = getXpubExplorerUrl(account, transaction)
  const blockExplorerUrl = getBlockExplorerUrl(account, transaction)

  return (
    <ListGroup.Item id={transaction.txid} variant={transaction.nativeAmount.startsWith('-') ? 'danger' : 'info'}>
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

      {xPubExplorerUrl ? (
        <NavLink target={'none'} href={xPubExplorerUrl}>
          View Xpub Details
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

const Metadata = ({ metadata }: { metadata: NonNullable<EdgeTransaction['metadata']> }) => {
  return (
    <div>
      <div>Name: {metadata.name}</div>
      <div>Category: {metadata.category}</div>
      <div>Notes: {metadata.notes}</div>
      <div>Exchange Amounts:</div>
      {metadata.exchangeAmount && <ExchangeAmounts exchangeAmounts={metadata.exchangeAmount} />}
    </div>
  )
}

const ExchangeAmounts = ({
  exchangeAmounts,
}: {
  exchangeAmounts: NonNullable<NonNullable<EdgeTransaction['metadata']>['exchangeAmount']>
}) => {
  return (
    <>
      {Object.entries(exchangeAmounts).map(([currencyCode, exchangeAmount]) => (
        <Boundary key={currencyCode}>
          <ExchangeAmount currencyCode={currencyCode} exchangeAmount={exchangeAmount} />
        </Boundary>
      ))}
    </>
  )
}

const ExchangeAmount: React.FC<{ currencyCode: string; exchangeAmount: number | string }> = ({
  currencyCode,
  exchangeAmount,
}) => {
  const account = useEdgeAccount()
  const displayDenomination = useDisplayDenomination(account, currencyCode)[0]
  const displayAmount = nativeToDenominated({
    nativeAmount: exchangeToNative({ account, currencyCode, exchangeAmount: String(exchangeAmount) }),
    denomination: displayDenomination,
  })

  return (
    <div>
      {displayDenomination.symbol} {Number(displayAmount).toFixed(2)} {displayDenomination.name}
    </div>
  )
}

const DisplayDate: React.FC<{ transaction: EdgeTransaction }> = ({ transaction }) => {
  const dateInMs = transaction.date * 1000
  const date = new Date(dateInMs)
  const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })

  return <>{formattedDate}</>
}
