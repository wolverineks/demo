import { RenderHookOptions, renderHook } from '@testing-library/react-hooks'
import { EdgeContextOptions, makeFakeEdgeWorld } from 'edge-core-js'
import * as React from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'

import { queryClientOptions } from '../../Edge'
import { fakeUser } from './fake-user'

export const makeFakeEdgeContext = async (plugins: EdgeContextOptions['plugins'] = {}) => {
  const quiet = { onLog: () => null }
  const world = await makeFakeEdgeWorld([fakeUser], quiet)
  const context = await world.makeEdgeContext({
    apiKey: '',
    appId: '',
    plugins,
  })

  return context
}

export const makeWrapper = () => {
  const queryClient = new QueryClient(queryClientOptions)
  const wrapper = ({ children }: { children: React.ReactChildren }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  return wrapper
}

export const render = (callback: () => any, options?: RenderHookOptions<any>) => {
  const result = renderHook(callback, {
    wrapper: makeWrapper(),
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
