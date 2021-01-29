import { act } from '@testing-library/react-hooks'
import { closeEdge } from 'edge-core-js'

import { defaultAutoLogout, useAutoLogout } from '../autoLogout'
import { fakeUser } from './fake-user'
import { makeFakeEdgeContext, render } from './utils'

const setup = async () => {
  const context = await makeFakeEdgeContext()
  const account = await context.loginWithPassword(fakeUser.username, fakeUser.password)

  return account
}

describe('autoLogout', () => {
  afterAll(closeEdge)

  it('useAutoLogout', async () => {
    const account = await setup()
    const { result, waitFor, waitForValueToChange } = render(() => useAutoLogout(account))

    await waitFor(() => {
      const [autoLogout, setAutoLogout] = result.current

      return !!autoLogout && !!setAutoLogout
    })

    {
      const [autoLogout] = result.current
      expect(autoLogout).toEqual(defaultAutoLogout)
    }

    act(() => {
      const [, setAutoLogout] = result.current
      setAutoLogout({ enabled: false, delay: 9999 })
    })

    await waitForValueToChange(() => result.current[0].enabled)

    {
      const [autoLogoutSetting] = result.current
      expect(autoLogoutSetting).toEqual({ enabled: false, delay: 9999 })
    }
  })
})
