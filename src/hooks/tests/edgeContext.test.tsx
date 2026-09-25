import { closeEdge } from 'edge-core-js'

import { useLoginMessages } from '../edgeContext'
import { fakeUser } from './fake-user'
import { render } from './utils'

describe('EdgeContext', () => {
  afterAll(closeEdge)

  it('useLoginMessages', async () => {
    const { result, waitFor } = render(() => useLoginMessages(fakeUser.username))
    await waitFor(() => !!result.current.loginId)

    const loginMessage = result.current
    expect(loginMessage.loginId).toBe(fakeUser.loginId)
  })
})
