import { div } from 'biggystring'
import { EdgeGetTransactionsOptions, EdgeTokenId, EdgeTransaction } from 'edge-core-js'

export type ExportTransactionsOptions = EdgeGetTransactionsOptions & {
  denomination?: string
  startIndex?: number
  startEntries?: number
}

const optionalCount = (value: number | undefined) =>
  value != null && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : undefined

export const formatTransactionExport = (
  transactions: Array<Pick<EdgeTransaction, 'txid' | 'date' | 'nativeAmount' | 'tokenId'>>,
  {
    denomination,
    startIndex,
    startEntries,
    currencyCode,
  }: {
    denomination?: string
    startIndex?: number
    startEntries?: number
    currencyCode: (tokenId: EdgeTokenId) => string
  },
) => {
  const index = optionalCount(startIndex) ?? 0
  const entries = optionalCount(startEntries)
  const selected = transactions.slice(index, entries != null ? index + entries : undefined)
  const header = 'txid,date,currencyCode,amount'
  const rows = selected.map((tx) => {
    const amount = denomination ? div(tx.nativeAmount, denomination, 18) : tx.nativeAmount

    return `${tx.txid},${tx.date},${currencyCode(tx.tokenId)},${amount}`
  })

  return [header, ...rows].join('\n')
}
