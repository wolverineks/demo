import { EdgeContext, EdgeContextOptions, makeEdgeContext, makeFakeEdgeWorld } from 'edge-core-js'
import { UseQueryOptions, useQuery } from 'react-query'

import { contextOptions, currencyPlugins, swapPlugins } from './contextOptions'
import { fakeUser } from './fake-user'

export const isTesting = process.env.NODE_ENV === 'test'
export const isDevelopment = process.env.NODE_ENV === 'development'
export const makeFakeEdgeContext = async (plugins: EdgeContextOptions['plugins'] = {}) => {
  const quiet = { onLog: () => null }
  const world = await makeFakeEdgeWorld([fakeUser], quiet)

  return world.makeEdgeContext({
    apiKey: '',
    appId: '',
    allowNetworkAccess: true,
    plugins,
  })
}

const fakePlugins = { ...currencyPlugins, ...swapPlugins }
const queryKey = ['context', 'fake-user-dump', 'utxo-eth-swap-1']
const queryFn = () =>
  isTesting || isDevelopment
    ? makeFakeEdgeContext(fakePlugins)
    : makeEdgeContext(contextOptions)

export const useEdgeContext = ({
  queryOptions,
}: {
  queryOptions?: UseQueryOptions<EdgeContext>
} = {}) => {
  const { data: context } = useQuery({
    queryKey,
    queryFn,
    suspense: true,
    cacheTime: Infinity,
    staleTime: Infinity,
    ...queryOptions,
  })

  return context!
}
