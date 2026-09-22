import { act } from '@testing-library/react-hooks'
import { closeEdge } from 'edge-core-js'

import { useTokens } from '../tokens'
import { fakeUser } from './fake-user'
import { makeFakeEdgeContext, render } from './utils'

const setup = async () => {
  const context = await makeFakeEdgeContext({ ethereum: true })
  const account = await context.loginWithPassword(fakeUser.username, fakeUser.password)
  const wallet = await account.waitForCurrencyWallet(account.activeWalletIds[0])

  return { wallet }
}

describe('useTokens', () => {
  afterAll(closeEdge)

  it('enables and disables a tokenId', async () => {
    const { wallet } = await setup()
    const { result, waitFor } = render(() => useTokens(wallet))

    await waitFor(() => result.current.availableTokenInfos.length > 0)
    expect(result.current.enabledTokenIds).toEqual([])

    const tokenId = result.current.availableTokenInfos[0].tokenId

    await act(async () => {
      await result.current.enable(tokenId)
    })

    await waitFor(() => expect(result.current.enabledTokenIds).toContain(tokenId))

    act(() => {
      result.current.disable(tokenId)
    })

    await waitFor(() => expect(result.current.enabledTokenIds).not.toContain(tokenId))
  })
})
