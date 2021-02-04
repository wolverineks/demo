import { EdgeContext, EdgeContextOptions, makeEdgeContext, makeFakeEdgeWorld } from 'edge-core-js'
import { UseQueryOptions, useQuery } from 'react-query'

import { contextOptions } from './contextOptions'
import { fakeUser } from '.'

export const isTesting = process.env.NODE_ENV === 'test'
export const isDevelopment = false // process.env.NODE_ENV === 'development'
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

const queryKey = 'context'
const queryFn = () =>
  isTesting || isDevelopment ? makeFakeEdgeContext({ bitcoin: true, ethereum: true }) : makeEdgeContext(contextOptions)

export const useEdgeContext = ({
  queryOptions,
}: {
  queryOptions?: UseQueryOptions<EdgeContext>
} = {}) => {
  const { data: context } = useQuery(queryKey, queryFn, {
    suspense: true,
    cacheTime: Infinity,
    staleTime: Infinity,
    ...queryOptions,
  })

  return context!
}
