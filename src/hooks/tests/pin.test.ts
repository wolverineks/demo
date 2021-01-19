import { act } from '@testing-library/react-hooks'
import { closeEdge } from 'edge-core-js'

import { usePin } from '../pin'
import { fakeUser } from './fake-user'
import { makeFakeEdgeContext, render } from './utils'

const setup = async () => {
  const context = await makeFakeEdgeContext({ bitcoin: true })
  const account = await context.loginWithPassword(fakeUser.username, fakeUser.password)

  return { context, account }
}

describe('usePin', () => {
  afterAll(closeEdge)

  it('usePin', async () => {
    const { context, account } = await setup()
    const { result, waitFor, waitForValueToChange } = render(() => usePin(context, account))
    await waitFor(() => !!result.current.checkPin)

    {
      const { pinExists, pinLoginEnabled } = result.current
      expect(pinExists).toBe(true)
      expect(pinLoginEnabled).toBe(true)
    }

    act(() => {
      const { changePinLogin } = result.current
      changePinLogin.mutate(false)
    })

    await waitForValueToChange(() => result.current.pinLoginEnabled)

    {
      const { pinLoginEnabled } = result.current
      expect(pinLoginEnabled).toBe(false)
    }

    act(() => {
      const { changePinLogin } = result.current
      changePinLogin.mutate(true)
    })

    await waitForValueToChange(() => result.current.pinLoginEnabled)

    {
      const { pinLoginEnabled } = result.current
      expect(pinLoginEnabled).toBe(true)
    }
  })
})
