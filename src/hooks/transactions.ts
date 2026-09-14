import { EdgeAccount, EdgeTransaction } from 'edge-core-js'

import { getCurrencyCodeFromTokenId } from '../utils'
import { Explorers } from './tokens'
import { useInfo } from './useInfo'

const getTransactionCurrencyCode = (account: EdgeAccount, transaction: EdgeTransaction) => {
  const wallet = account.currencyWallets[transaction.walletId]
  if (!wallet) throw new Error(`404: wallet:${transaction.walletId} not found`)

  return getCurrencyCodeFromTokenId(wallet, transaction.tokenId)
}

export const useTransactionExplorerUrl = (account: EdgeAccount, transaction: EdgeTransaction) => {
  return (useInfo(account, getTransactionCurrencyCode(account, transaction)) as Explorers).transactionExplorer?.replace(
    '%s',
    transaction.txid,
  )
}

export const useAddressExplorerUrl = (account: EdgeAccount, transaction: EdgeTransaction) => {
  return (useInfo(account, getTransactionCurrencyCode(account, transaction)) as Explorers).addressExplorer?.replace(
    '%s',
    transaction.ourReceiveAddresses[0],
  )
}

export const useBlockExplorerUrl = (account: EdgeAccount, transaction: EdgeTransaction) => {
  return (useInfo(account, getTransactionCurrencyCode(account, transaction)) as Explorers).blockExplorer?.replace(
    '%s',
    String(transaction.blockHeight),
  )
}
