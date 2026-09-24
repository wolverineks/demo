import { EdgeCurrencyWallet } from 'edge-core-js'

import { toWalletSnapshot, walletSnapshotFromJson } from '../snapshots'

const USDT = 'dac17f958d2ee523a2206206994597c13d831ec7'

const wallet = {
  id: 'wallet-id',
  name: 'My Ethereum',
  fiatCurrencyCode: 'iso:USD',
  currencyInfo: { pluginId: 'ethereum', currencyCode: 'ETH' },
  enabledTokenIds: [USDT, 'missing'],
  currencyConfig: { allTokens: { [USDT]: { currencyCode: 'USDT' } } },
  balanceMap: new Map<string | null, string>([
    [null, '1000000000000000000'],
    [USDT, '2500000'],
  ]),
} as unknown as EdgeCurrencyWallet

describe('wallet snapshots', () => {
  it('stores balanceMap entries by token id', () => {
    expect(toWalletSnapshot(wallet)).toEqual({
      id: 'wallet-id',
      name: 'My Ethereum',
      fiatCurrencyCode: 'iso:USD',
      pluginId: 'ethereum',
      tokenBalances: [
        { tokenId: null, nativeAmount: '1000000000000000000' },
        { tokenId: USDT, nativeAmount: '2500000' },
      ],
    })
    expect(JSON.parse(JSON.stringify(toWalletSnapshot(wallet))).tokenBalances[0].tokenId).toBeNull()
  })

  it('reads a legacy balances object as the parent coin', () => {
    expect(
      walletSnapshotFromJson({
        id: 'wallet-id',
        name: 'My Ethereum',
        fiatCurrencyCode: 'iso:USD',
        currencyInfo: { pluginId: 'ethereum', currencyCode: 'ETH' },
        balances: { ETH: '1000000000000000000' },
      }),
    ).toEqual({
      id: 'wallet-id',
      name: 'My Ethereum',
      fiatCurrencyCode: 'iso:USD',
      pluginId: 'ethereum',
      tokenBalances: [{ tokenId: null, nativeAmount: '1000000000000000000' }],
    })
  })
})
