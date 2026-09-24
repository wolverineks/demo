import { EdgeAccount, EdgeCurrencyWallet } from 'edge-core-js'

import { getExchangeInfos } from '../rates'

const USDT = {
  ethereum: 'dac17f958d2ee523a2206206994597c13d831ec7',
  optimism: '94b008aa00579c1307b0ef2c499ad98a8ce58e58',
}

const wallet = (pluginId: string, enabledTokenIds: string[], fiatCurrencyCode = 'iso:USD') =>
  ({
    currencyInfo: { pluginId, currencyCode: 'ETH' },
    currencyConfig: {
      allTokens: Object.fromEntries(enabledTokenIds.map((tokenId) => [tokenId, { currencyCode: 'USDT' }])),
    },
    enabledTokenIds,
    fiatCurrencyCode,
  } as EdgeCurrencyWallet)

describe('getExchangeInfos', () => {
  it('keeps a row per plugin and token id when the currency code matches', () => {
    const account = {
      currencyWallets: {
        ethereum: wallet('ethereum', [USDT.ethereum]),
        ethereumAgain: wallet('ethereum', [USDT.ethereum]),
        optimism: wallet('optimism', [USDT.optimism]),
      },
    } as EdgeAccount

    expect(getExchangeInfos(account)).toEqual([
      { pluginId: 'ethereum', tokenId: null, currencyCode: 'ETH', fiatCurrencyCode: 'iso:USD' },
      { pluginId: 'ethereum', tokenId: USDT.ethereum, currencyCode: 'USDT', fiatCurrencyCode: 'iso:USD' },
      { pluginId: 'optimism', tokenId: null, currencyCode: 'ETH', fiatCurrencyCode: 'iso:USD' },
      { pluginId: 'optimism', tokenId: USDT.optimism, currencyCode: 'USDT', fiatCurrencyCode: 'iso:USD' },
    ])
  })
})
