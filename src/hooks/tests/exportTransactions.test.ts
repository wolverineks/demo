import { formatTransactionExport } from '../exportTransactions'

const tx = (txid: string, nativeAmount: string, date = 10) => ({
  txid,
  date,
  nativeAmount,
  tokenId: null,
})

describe('formatTransactionExport', () => {
  const transactions = [tx('a', '100000000'), tx('b', '-250000000'), tx('c', '1'), tx('d', '300000000')]

  it('converts amounts with the selected denomination and windows the rows', () => {
    expect(
      formatTransactionExport(transactions, {
        denomination: '100000000',
        startIndex: 1,
        startEntries: 2,
        currencyCode: () => 'BTC',
      }),
    ).toBe(['txid,date,currencyCode,amount', 'b,10,BTC,-2.5', 'c,10,BTC,0.00000001'].join('\n'))
  })

  it('exports every native amount when the window and denomination are blank', () => {
    expect(
      formatTransactionExport([tx('a', '5')], {
        currencyCode: () => 'BTC',
      }),
    ).toBe(['txid,date,currencyCode,amount', 'a,10,BTC,5'].join('\n'))
  })

  it('returns only the header when start entries is zero', () => {
    expect(
      formatTransactionExport(transactions, {
        startEntries: 0,
        currencyCode: () => 'BTC',
      }),
    ).toBe('txid,date,currencyCode,amount')
  })
})
