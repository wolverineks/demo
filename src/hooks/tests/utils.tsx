import { RenderHookOptions, renderHook } from '@testing-library/react-hooks'
import { EdgeContextOptions, makeFakeEdgeWorld } from 'edge-core-js'

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
