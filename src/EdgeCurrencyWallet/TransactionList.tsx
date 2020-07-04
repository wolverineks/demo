import { EdgeAccount, EdgeCurrencyWallet, EdgeTransaction } from 'edge-core-js'
import { useTransactionCount, useTransactions, useWatchAll } from 'edge-react-hooks'
import * as React from 'react'
import { Button, Form, ListGroup } from 'react-bootstrap'

import { DisplayAmount } from '../Components/DisplayAmount'
import { Select } from '../Components/Select'
import { getCurrencyCodes, getCurrencyInfoFromCurrencyCode } from '../utils'

const initialTransactionCount = 10
const transactionCounts = [1, 5, 10, 15, 20, 25]

export const TransactionList: React.FC<{
  account: EdgeAccount
  wallet: EdgeCurrencyWallet
}> = ({ account, wallet }) => {
  useWatchAll(wallet)
  const [currencyCode, setCurrencyCode] = React.useState<string>(wallet.currencyInfo.currencyCode)
  const [startEntries, setStartEntries] = React.useState<number>(initialTransactionCount)
  const options = React.useMemo(() => ({ currencyCode, startEntries }), [currencyCode, startEntries])
  const { data: transactions, status } = useTransactions(wallet, { options })
  const { data: transactionCount } = useTransactionCount(wallet, { options })
  const currencyCodes = getCurrencyCodes(wallet)

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

        <Select
          title={'# of transactions'}
          options={transactionCount ? [...transactionCounts, transactionCount] : transactionCounts}
          renderOption={(num: number) => (
            <option key={num} value={num}>
              {num}
            </option>
          )}
          defaultValue={String(initialTransactionCount)}
          onSelect={(event) => setStartEntries(+event.currentTarget.value)}
        />
      </Form>

      <ListGroup>
        Transactions: #:{String(transactionCount)}
        <Button title={'ResyncBlockchain'} onClick={() => wallet.resyncBlockchain()}>
          ResyncBlockchain
        </Button>
        <Button
          title={'getTransactions'}
          onClick={() => wallet.getTransactions().then((transactions) => console.log({ transactions }))}
        >
          getTransactions
        </Button>
        <Button title={'sync'} onClick={() => wallet.sync()}>
          sync
        </Button>
        {status === 'loading' && <div>Loading transactions...</div>}
        {transactionCount !== undefined && transactionCount <= 0 && <div>No Transactions</div>}
        {transactions &&
          transactions.map((transaction) => (
            <TransactionListRow account={account} wallet={wallet} transaction={transaction} key={transaction.txid} />
          ))}
      </ListGroup>
    </ListGroup>
  )
}

const TransactionListRow: React.FC<{
  account: EdgeAccount
  wallet: EdgeCurrencyWallet
  transaction: EdgeTransaction
}> = ({ account, wallet, transaction }) => {
  const currencyInfo = getCurrencyInfoFromCurrencyCode({
    wallet,
    currencyCode: transaction.currencyCode,
  })

  return (
    <ListGroup.Item id={transaction.txid} variant={transaction.nativeAmount.startsWith('-') ? 'danger' : 'info'}>
      <span>
        {transaction.date}:{' '}
        <DisplayAmount account={account} nativeAmount={transaction.nativeAmount} currencyInfo={currencyInfo} />
      </span>

      {transaction.metadata && (
        <div>
          <div>Metadata</div>
          <div>Fiat: {transaction.metadata.amountFiat}</div>
          <div>Name: {transaction.metadata.name}</div>
          <div>Notes: {transaction.metadata.notes}</div>
          <div>Category: {transaction.metadata.category}</div>
          <div>Other: {JSON.stringify(transaction.metadata.miscJson, null, 2)}</div>
        </div>
      )}
    </ListGroup.Item>
  )
}
