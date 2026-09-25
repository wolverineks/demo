import { act } from '@testing-library/react-hooks'
import { EdgeAccount, closeEdge } from 'edge-core-js'
import React from 'react'

import { EdgeAccountContext } from '../../auth'
import { EdgeCache } from '../../Edge'
import { useDenominations } from '../denominations'
import { useCryptoInfo } from '../useInfo'
import { fakeUser } from './fake-user'
import { makeFakeEdgeContext, render } from './utils'

const AccountCache: React.FC<{ account: EdgeAccount }> = ({ account, children }) =>
  React.createElement(
    EdgeCache,
    null,
    React.createElement(EdgeAccountContext.Provider, { value: account }, children),
  )

const setup = async () => {
  const context = await makeFakeEdgeContext({ bitcoin: true })
  const account = await context.loginWithPassword(fakeUser.username, fakeUser.password)

  return account
}

describe('denominations', () => {
  afterAll(closeEdge)

  it('useDenominations', async () => {
    const account = await setup()
    const { result: denominations, waitFor, waitForValueToChange } = render(
      () => {
        const info = useCryptoInfo('bitcoin', null)

        return useDenominations(info)
      },
      { wrapper: ({ children }) => React.createElement(AccountCache, { account }, children) },
    )

    await waitFor(() => !!denominations.current.all)
    {
      const { all, display } = denominations.current
      expect(display).toEqual(all[0])
    }

    act(() => {
      const { all, setDisplay } = denominations.current
      setDisplay(all[1].multiplier)
    })

    await waitForValueToChange(() => denominations.current.display)

    {
      const { all, display } = denominations.current
      expect(display).toEqual(all[1])
    }
  })
})
