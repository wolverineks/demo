import { renderHook } from '@testing-library/react-hooks'
import { EdgeContext, closeEdge } from 'edge-core-js'

import { useLoginMessages } from '../edgeContext'
import { fakeUser } from './fake-user'
import { makeFakeEdgeContext, makeWrapper } from './utils'

const setup = async () => {
  const context = await makeFakeEdgeContext()

  return context
}

describe('EdgeContext', () => {
  let context: EdgeContext
  beforeAll(async () => (context = await setup()))
  afterAll(closeEdge)

  it('useLoginMessages', async () => {
    const { result, waitFor } = renderHook(() => useLoginMessages(context, fakeUser.username), {
      wrapper: makeWrapper(),
    })
    await waitFor(() => !!result.current.loginId)

    const loginMessage = result.current
    expect(loginMessage.loginId).toBe(fakeUser.loginId)
  })
})
