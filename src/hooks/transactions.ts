import { EdgeAccount, EdgeTransaction } from 'edge-core-js'

import { useInfo } from './useInfo'

export const useTransactionExplorerUrl = (account: EdgeAccount, transaction: EdgeTransaction) => {
  return (useInfo(account, transaction.currencyCode) as any).transactionExplorer?.replace('%s', transaction.txid)
}

export const useAddressExplorerUrl = (account: EdgeAccount, transaction: EdgeTransaction) => {
  return (useInfo(account, transaction.currencyCode) as any).addressExplorer?.replace('%s', transaction.txid)
}

export const useBlockExplorerUrl = (account: EdgeAccount, transaction: EdgeTransaction) => {
  return (useInfo(account, transaction.currencyCode) as any).addressExplorer?.replace('%s', transaction.txid)
}

export const useXpubExplorerUrl = (account: EdgeAccount, transaction: EdgeTransaction) => {
  return (useInfo(account, transaction.currencyCode) as any).addressExplorer?.replace('%s', transaction.txid)
}
