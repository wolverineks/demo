import { EdgeAccount, EdgeTransaction } from 'edge-core-js'

import { Explorers } from './tokens'
import { getCryptoInfo } from './useInfo'

const getTransactionExplorers = (account: EdgeAccount, transaction: EdgeTransaction) => {
  const wallet = account.currencyWallets[transaction.walletId]
  if (!wallet) throw new Error(`404: wallet:${transaction.walletId} not found`)

  return getCryptoInfo(account, wallet.currencyInfo.pluginId, transaction.tokenId) as ReturnType<
    typeof getCryptoInfo
  > &
    Explorers
}

export const useTransactionExplorerUrl = (account: EdgeAccount, transaction: EdgeTransaction) => {
  return getTransactionExplorers(account, transaction).transactionExplorer?.replace('%s', transaction.txid)
}

export const useAddressExplorerUrl = (account: EdgeAccount, transaction: EdgeTransaction) => {
  return getTransactionExplorers(account, transaction).addressExplorer?.replace('%s', transaction.ourReceiveAddresses[0])
}

export const useBlockExplorerUrl = (account: EdgeAccount, transaction: EdgeTransaction) => {
  return getTransactionExplorers(account, transaction).blockExplorer?.replace('%s', String(transaction.blockHeight))
}
