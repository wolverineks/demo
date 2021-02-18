import { EdgeAccount, EdgeTransaction } from 'edge-core-js'

import { Explorers } from './tokens'
import { useInfo } from './useInfo'

export const useTransactionExplorerUrl = (account: EdgeAccount, transaction: EdgeTransaction) => {
  return (useInfo(account, transaction.currencyCode) as Explorers).transactionExplorer?.replace('%s', transaction.txid)
}

export const useAddressExplorerUrl = (account: EdgeAccount, transaction: EdgeTransaction) => {
  return (useInfo(account, transaction.currencyCode) as Explorers).addressExplorer?.replace(
    '%s',
    transaction.ourReceiveAddresses[0],
  )
}

export const useBlockExplorerUrl = (account: EdgeAccount, transaction: EdgeTransaction) => {
  return (useInfo(account, transaction.currencyCode) as Explorers).blockExplorer?.replace(
    '%s',
    String(transaction.blockHeight),
  )
}
