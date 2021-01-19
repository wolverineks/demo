import { act } from '@testing-library/react-hooks'
import { closeEdge } from 'edge-core-js'

import { useTokens } from '../tokens'
import { fakeUser } from './fake-user'
import { makeFakeEdgeContext, render } from './utils'

const setup = async () => {
  const context = await makeFakeEdgeContext({ ethereum: true })
  const account = await context.loginWithPassword(fakeUser.username, fakeUser.password)
  const wallet = await account.waitForCurrencyWallet(account.activeWalletIds[0])

  return { account, wallet }
}

describe('useTokens', () => {
  afterAll(closeEdge)

  it('useTokens', async () => {
    const { account, wallet } = await setup()
    const { result, waitFor, waitForValueToChange } = render(() => useTokens(account, wallet))
    await waitFor(() => !!result.current.availableTokens)
    await waitFor(() => !!result.current.availableTokenInfos)
    await waitFor(() => !!result.current.availableTokenInfos)
    expect(result.current.enabledTokens).toEqual([])

    act(() => {
      const { enableToken, availableTokens } = result.current
      enableToken(availableTokens[0])
    })

    await waitForValueToChange(() => result.current.enabledTokens)

    {
      const { enabledTokens, availableTokens } = result.current
      expect(enabledTokens).toContain(availableTokens[0])
    }

    act(() => {
      const { disableToken, availableTokens } = result.current
      disableToken(availableTokens[0])
    })

    await waitForValueToChange(() => result.current.enabledTokens)

    {
      const { enabledTokens, availableTokens } = result.current
      expect(enabledTokens).not.toContain(availableTokens[0])
    }
  })
})
