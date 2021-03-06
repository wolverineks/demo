import { act } from '@testing-library/react-hooks'
import { EdgeAccount, closeEdge } from 'edge-core-js'

import { useOTP } from '../otp'
import { fakeUser } from './fake-user'
import { makeFakeEdgeContext, render } from './utils'

const setup = async () => {
  const context = await makeFakeEdgeContext({ bitcoin: true })
  const account = await context.loginWithPassword(fakeUser.username, fakeUser.password)

  return account
}

describe('useOTP', () => {
  let account: EdgeAccount
  beforeAll(async () => (account = await setup()))
  afterAll(closeEdge)

  it('useOTP', async () => {
    const { result, waitFor, waitForValueToChange } = render(() => useOTP(account))
    await waitFor(() => !!result.current.disableOTP)

    {
      const enabled = result.current.enabled
      expect(enabled).toBe(false)
    }

    act(() => result.current.enableOTP())

    await waitForValueToChange(() => result.current.enabled, { timeout: 9999 })
    expect(result.current.enabled).toBe(true)

    act(() => result.current.disableOTP())

    await waitForValueToChange(() => result.current.enabled)

    {
      const enabled = result.current.enabled
      expect(enabled).toBe(false)
    }
  })
})
