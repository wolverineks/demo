import { act } from '@testing-library/react-hooks'
import { EdgeAccount, closeEdge } from 'edge-core-js'

import { useDefaultFiatCurrencyCode, useEdgeCurrencyWallet } from '../edgeAccount'
import { fakeUser } from './fake-user'
import { makeFakeEdgeContext, render } from './utils'

const setup = async () => {
  const context = await makeFakeEdgeContext({ bitcoin: true })
  const account = await context.loginWithPassword(fakeUser.username, fakeUser.password)

  return account
}

describe('EdgeAccount', () => {
  let account: EdgeAccount
  beforeAll(async () => (account = await setup()))
  afterAll(closeEdge)

  it('useEdgeCurrencyWallet', async () => {
    const walletId = 'FQwJxxej9q3Y81KsjjXeers03e/8hsvdWRSXLrrR55g='
    const { result, waitFor } = render(() => useEdgeCurrencyWallet({ account, walletId }))
    await waitFor(() => !!result.current.id)

    const wallet = result.current
    expect(wallet.id).toBe(walletId)
  })

  it('useDefaultFiatCurrencyCode', async () => {
    const { result, waitFor, waitForValueToChange } = render(() => useDefaultFiatCurrencyCode(account))
    await waitFor(() => !!result.current[0])

    {
      const [fiatCurrencyCode] = result.current
      expect(fiatCurrencyCode).toBe('iso:USD')
    }

    act(() => {
      const [, setDefaultFiatCurrencyCode] = result.current
      setDefaultFiatCurrencyCode('iso:CAD')
    })

    await waitForValueToChange(() => result.current[0])

    {
      const [fiatCurrencyCode] = result.current
      expect(fiatCurrencyCode).toBe('iso:CAD')
    }
  })
})
