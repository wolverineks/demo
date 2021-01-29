import { act } from '@testing-library/react-hooks'
import { EdgeCurrencyWallet, closeEdge } from 'edge-core-js'

import {
  useFiatCurrencyCode,
  useMaxSpendable,
  useReceiveAddressAndEncodeUri,
  useTransactions,
} from '../edgeCurrencyWallet'
import { fakeUser } from './fake-user'
import { makeFakeEdgeContext, render } from './utils'

const setup = async () => {
  const context = await makeFakeEdgeContext({ bitcoin: true })
  const account = await context.loginWithPassword(fakeUser.username, fakeUser.password)
  const wallet = await account.waitForCurrencyWallet(account.activeWalletIds[0])

  return wallet
}

describe('EdgeCurrencyWallet', () => {
  let wallet: EdgeCurrencyWallet
  beforeAll(async () => (wallet = await setup()))
  afterAll(closeEdge)

  it('useFiatCurrencyCode', async () => {
    const { result, waitFor, waitForValueToChange } = render(() => useFiatCurrencyCode(wallet))
    await waitFor(() => {
      const [fiatCurrencyCode, setFiatCurrencyCode] = result.current

      return !!fiatCurrencyCode && !!setFiatCurrencyCode
    })

    {
      const [fiatCurrencyCode] = result.current
      expect(fiatCurrencyCode).toBe('iso:USD')
    }

    act(() => {
      const [, setFiatCurrencyCode] = result.current
      setFiatCurrencyCode('iso:CAD')
    })

    await waitForValueToChange(() => {
      const [fiatCurrencyCode] = result.current

      return fiatCurrencyCode
    })

    {
      const [fiatCurrencyCode] = result.current
      expect(fiatCurrencyCode).toBe('iso:CAD')
    }
  })

  it('useReceiveAddressAndEncodeUri', async () => {
    const { result, waitFor } = render(() => useReceiveAddressAndEncodeUri({ wallet, nativeAmount: '0' }))
    await waitFor(() => !!result.current.data)

    const { receiveAddress, uri } = result.current.data
    expect(uri).toBe('bitcoin:3HpJi2bWVLv7L5iCwnCj935wiqAuTZZnZk?amount=0')
    expect(receiveAddress).toEqual({
      legacyAddress: '3HpJi2bWVLv7L5iCwnCj935wiqAuTZZnZk',
      metadata: {
        bizId: 0,
        category: '',
        exchangeAmount: {},
        name: '',
        notes: '',
      },
      nativeAmount: '0',
      publicAddress: '3HpJi2bWVLv7L5iCwnCj935wiqAuTZZnZk',
      segwitAddress: undefined,
    })
  })

  it('useTransactions', async () => {
    const { result, waitFor } = render(() => useTransactions(wallet))
    await waitFor(() => {
      const transactions = result.current

      return !!transactions
    })

    const transactions = result.current
    expect(transactions).toEqual(expect.any(Array))
  })

  it('useMaxSpendable', async () => {
    const { result, waitFor } = render(() => useMaxSpendable(wallet, { spendTargets: [] }))
    await waitFor(() => {
      const maxSpendable = result.current

      return !!maxSpendable
    })

    const maxSpendable = result.current
    expect(maxSpendable).toBe('0')
  })
})
