import { EdgeCurrencyWallet, EdgeTransaction } from 'edge-core-js'
import React from 'react'
import { FormControl, ListGroup, NavLink } from 'react-bootstrap'

import { useEdgeAccount } from '../auth'
import { Boundary, DisplayAmount } from '../components'
import { useDisplayDenomination, useTransactionCount, useTransactions } from '../hooks'
import { exchangeToNative, getTxUrl, nativeToDenominated } from '../utils'

const normalize = (text: string) => text.trim().toLowerCase()

const matches = (query: string) => (transaction: EdgeTransaction): boolean => {
  return (
    transaction.txid.includes(query) ||
    new Date(transaction.date).toLocaleString().includes(query) ||
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
  const [searchQuery, setSearchQuery] = React.useState('')
  const transactionCount = useTransactionCount(wallet, { currencyCode })
  const transactions = useTransactions(wallet, { currencyCode })
  const visibleTransactions = transactions.filter(matches(searchQuery))

  return (
    <ListGroup>
      <ListGroup>
        Transactions: {transactionCount} ({visibleTransactions.length})
        <FormControl placeholder={'Search'} onChange={(event) => setSearchQuery(event.currentTarget.value)} />
        {transactionCount <= 0 ? (
          <div>No Transactions</div>
        ) : (
          visibleTransactions.map((transaction) => (
            <TransactionListRow
              transaction={transaction as EdgeTransaction}
              key={(transaction as EdgeTransaction).txid}
            />
          ))
        )}
      </ListGroup>
    </ListGroup>
  )
}

const TransactionListRow: React.FC<{ transaction: EdgeTransaction }> = ({ transaction }) => {
  const account = useEdgeAccount()

  return (
    <ListGroup.Item id={transaction.txid} variant={transaction.nativeAmount.startsWith('-') ? 'danger' : 'info'}>
      <span>
        <DisplayDate transaction={transaction} />:{' '}
        <DisplayAmount nativeAmount={transaction.nativeAmount} currencyCode={transaction.currencyCode} />{' '}
        {transaction.txid}
      </span>

      {transaction.metadata && (
        <div>
          <div>Name: {transaction.metadata.name}</div>
          <div>Category: {transaction.metadata.category}</div>
          <div>Notes: {transaction.metadata.notes}</div>
          <div>Exchange Amounts:</div>
          {transaction.metadata.exchangeAmount &&
            Object.entries(transaction.metadata.exchangeAmount).map(([currencyCode, exchangeAmount]) => (
              <Boundary key={currencyCode}>
                <DisplayFiatAmount currencyCode={currencyCode} exchangeAmount={exchangeAmount} />
              </Boundary>
            ))}
        </div>
      )}

      <NavLink target={'none'} href={getTxUrl(account, transaction)}>
        View Details
      </NavLink>
    </ListGroup.Item>
  )
}

const DisplayFiatAmount: React.FC<{ currencyCode: string; exchangeAmount: number | string }> = ({
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
