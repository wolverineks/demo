import { EdgeContext, makeEdgeContext } from 'edge-core-js'
import { QueryOptions, useQuery } from 'react-query'

import { useWatchAll } from '../hooks'
import { contextOptions } from './contextOptions'

const queryKey = 'context'
const queryFn = () => makeEdgeContext(contextOptions)

export const useEdgeContext = (config?: QueryOptions<EdgeContext>, watch?: readonly (keyof EdgeContext)[]) => {
  const { data: context } = useQuery(queryKey, queryFn, {
    suspense: true,
    cacheTime: Infinity,
    staleTime: Infinity,
    ...config,
  })

  useWatchAll(context, watch)

  return context!
}
