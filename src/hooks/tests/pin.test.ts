import { act } from '@testing-library/react-hooks'
import { closeEdge } from 'edge-core-js'

import { useEdgeContext } from '../../Edge/useEdgeContext'
import { usePin } from '../pin'
import { fakeUser } from './fake-user'
import { accountCache, render } from './utils'

describe('usePin', () => {
  afterAll(closeEdge)

  it('usePin', async () => {
    const { result: contextResult, waitFor: waitForContext } = render(() => useEdgeContext())
    await waitForContext(() => contextResult.current != null)
    const account = await contextResult.current.loginWithPassword(fakeUser.username, fakeUser.password)
    const { result, waitFor, waitForValueToChange } = render(() => usePin(), {
      wrapper: accountCache(account),
    })
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
