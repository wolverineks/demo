import { EdgeCurrencyWallet, EdgeTransaction } from 'edge-core-js'
import React from 'react'
import { Form, ListGroup } from 'react-bootstrap'

import { DisplayAmount, Select } from '../components'
import { useCurrencyCodes, useTransactionCount, useTransactions } from '../hooks'

export const TransactionList: React.FC<{ wallet: EdgeCurrencyWallet }> = ({ wallet }) => {
  const [currencyCode, setCurrencyCode] = React.useState<string>(wallet.currencyInfo.currencyCode)
  const currencyCodes = useCurrencyCodes(wallet)
  const transactionCount = useTransactionCount(wallet)
  const transactions = useTransactions(wallet).filter((transaction) => transaction.currencyCode === currencyCode)

  return (
    <ListGroup>
      <Form>
        <Select
          title={'CurrencyCode'}
          options={currencyCodes}
          renderOption={(currencyCode) => (
            <option key={currencyCode} value={currencyCode}>
              {currencyCode}
            </option>
          )}
          onSelect={(event) => setCurrencyCode(event.currentTarget.value)}
        />
      </Form>

      <ListGroup>
        Transactions: #:{String(transactionCount)}
        {transactionCount <= 0 && <div>No Transactions</div>}
        {transactions.map((transaction) => (
          <TransactionListRow
            transaction={transaction as EdgeTransaction}
            key={(transaction as EdgeTransaction).txid}
          />
        ))}
      </ListGroup>
    </ListGroup>
  )
}

const TransactionListRow: React.FC<{
  transaction: EdgeTransaction
}> = ({ transaction }) => (
  <ListGroup.Item id={transaction.txid} variant={transaction.nativeAmount.startsWith('-') ? 'danger' : 'info'}>
    <span>
      <DisplayDate transaction={transaction} />:{' '}
      <DisplayAmount nativeAmount={transaction.nativeAmount} currencyCode={transaction.currencyCode} />{' '}
      {transaction.txid}
    </span>
  </ListGroup.Item>
)

const DisplayDate: React.FC<{ transaction: EdgeTransaction }> = ({ transaction }) => {
  const dateInMs = transaction.date * 1000
  const date = new Date(dateInMs)
  const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })

  return <>{formattedDate}</>
}
