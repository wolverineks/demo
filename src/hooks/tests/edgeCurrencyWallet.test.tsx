import { act } from '@testing-library/react-hooks'
import { EdgeCurrencyWallet, closeEdge } from 'edge-core-js'

import {
  useBroadcastTx,
  useFiatCurrencyCode,
  useMaxSpendable,
  useReceiveAddressAndEncodeUri,
  useSaveTx,
  useSignBroadcastAndSaveTx,
  useSignTx,
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

    const { publicAddress, addresses, uri } = result.current.data
    expect(uri).toBe('bitcoin:3HpJi2bWVLv7L5iCwnCj935wiqAuTZZnZk?amount=0')
    expect(publicAddress).toBe('3HpJi2bWVLv7L5iCwnCj935wiqAuTZZnZk')
    expect(addresses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          addressType: expect.any(String),
          publicAddress: '3HpJi2bWVLv7L5iCwnCj935wiqAuTZZnZk',
        }),
      ]),
    )
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

  it('useSignTx, useBroadcastTx, and useSaveTx', () => {
    const { result } = render(() => ({
      signTx: useSignTx(wallet),
      broadcastTx: useBroadcastTx(wallet),
      saveTx: useSaveTx(wallet),
      sendTx: useSignBroadcastAndSaveTx(wallet),
    }))

    expect(result.current.signTx.mutateAsync).toEqual(expect.any(Function))
    expect(result.current.broadcastTx.mutateAsync).toEqual(expect.any(Function))
    expect(result.current.saveTx.mutateAsync).toEqual(expect.any(Function))
    expect(result.current.sendTx.mutateAsync).toEqual(expect.any(Function))
  })
})
