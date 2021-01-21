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
    const { result: denominations, waitFor, waitForValueToChange } = render(() => useDenominations(account, 'BTC'))

    await waitFor(() => !!denominations.current.all)
    {
      const { all, display } = denominations.current
      expect(display).toEqual(all[0])
    }

    act(() => {
      const { all, setDisplay } = denominations.current
      setDisplay(all[1])
    })

    await waitForValueToChange(() => denominations.current.display)

    {
      const { all, display } = denominations.current
      expect(display).toBe(all[1])
    }
  })
})
