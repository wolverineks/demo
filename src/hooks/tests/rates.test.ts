import { EdgeAccount, EdgeCurrencyWallet } from 'edge-core-js'

import { getRatePairs } from '../rates'

const USDT = {
  ethereum: 'dac17f958d2ee523a2206206994597c13d831ec7',
  optimism: '94b008aa00579c1307b0ef2c499ad98a8ce58e58',
}

const wallet = (pluginId: string, enabledTokenIds: string[], fiatCurrencyCode = 'iso:USD') =>
  ({
    currencyInfo: { pluginId },
    enabledTokenIds,
    fiatCurrencyCode,
  } as EdgeCurrencyWallet)

describe('getRatePairs', () => {
  it('keeps a pair per plugin and token id when the currency code matches', () => {
    const account = {
      currencyWallets: {
        ethereum: wallet('ethereum', [USDT.ethereum]),
        ethereumAgain: wallet('ethereum', [USDT.ethereum]),
        optimism: wallet('optimism', [USDT.optimism]),
      },
    } as EdgeAccount

    expect(getRatePairs(account)).toEqual([
      { pluginId: 'ethereum', tokenId: null, fiatCurrencyCode: 'iso:USD' },
      { pluginId: 'ethereum', tokenId: USDT.ethereum, fiatCurrencyCode: 'iso:USD' },
      { pluginId: 'optimism', tokenId: null, fiatCurrencyCode: 'iso:USD' },
      { pluginId: 'optimism', tokenId: USDT.optimism, fiatCurrencyCode: 'iso:USD' },
    ])
  })
})
