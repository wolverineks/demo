import { EdgeContext, EdgeContextOptions, makeEdgeContext, makeFakeEdgeWorld } from 'edge-core-js'
import { UseQueryOptions, useQuery } from 'react-query'

import { contextOptions, currencyPlugins } from './contextOptions'
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

const queryKey = ['context', 'fake-user-dump', 'utxo-plugins-1']
const queryFn = () =>
  isTesting || isDevelopment
    ? makeFakeEdgeContext(currencyPlugins)
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
