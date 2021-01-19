import { act } from '@testing-library/react-hooks'
import { closeEdge } from 'edge-core-js'

import { useDenominations } from '../denominations'
import { fakeUser } from './fake-user'
import { makeFakeEdgeContext, render } from './utils'

const setup = async () => {
  const context = await makeFakeEdgeContext({ bitcoin: true })
  const account = await context.loginWithPassword(fakeUser.username, fakeUser.password)

  return account
}

describe('denominations', () => {
  afterAll(closeEdge)

  it('useDenominations', async () => {
    const account = await setup()
    const { result, waitFor, waitForValueToChange } = render(() => useDenominations(account, 'BTC'))

    await waitFor(() => !!result.current.denominations)
    {
      const {
        denominations,
        display: [displayDenomination],
      } = result.current
      expect(displayDenomination).toEqual(denominations[0])
    }

    act(() => {
      const {
        denominations,
        display: [, setDisplayDenomination],
      } = result.current
      setDisplayDenomination(denominations[1])
    })

    await waitForValueToChange(() => result.current.display[0])

    {
      const {
        denominations,
        display: [displayDenomination],
      } = result.current
      expect(displayDenomination).toBe(denominations[1])
    }
  })
})
