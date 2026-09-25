import { RenderHookOptions, renderHook } from '@testing-library/react-hooks'
import { EdgeAccount, EdgeContextOptions, makeFakeEdgeWorld } from 'edge-core-js'
import React from 'react'

import { EdgeAccountContext } from '../../auth'
import { EdgeCache } from '../../Edge'
import { fakeUser } from './fake-user'

export const makeFakeEdgeContext = async (plugins: EdgeContextOptions['plugins'] = {}) => {
  const quiet = { onLog: () => null }
  const world = await makeFakeEdgeWorld([fakeUser], quiet)

  return world.makeEdgeContext({
    apiKey: '',
    appId: '',
    plugins,
  })
}

export const accountCache = (account: EdgeAccount): React.FC => {
  const AccountCache: React.FC = ({ children }) =>
    React.createElement(EdgeCache, null, React.createElement(EdgeAccountContext.Provider, { value: account }, children))

  return AccountCache
}

export const render = (callback: () => any, options?: RenderHookOptions<any>) => {
  const result = renderHook(callback, {
    wrapper: EdgeCache,
    ...options,
  })

  const _waitFor: typeof result.waitFor = (callback, options) =>
    result.waitFor(callback, { timeout: 10000, ...options })

  const _waitForValueToChange: typeof result.waitForValueToChange = (value, options) =>
    result.waitForValueToChange(value, { timeout: 10000, ...options })

  return {
    ...result,
    waitFor: _waitFor,
    waitForValueToChange: _waitForValueToChange,
  }
}
