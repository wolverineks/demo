import { EdgeContext, makeEdgeContext } from 'edge-core-js'
import { UseQueryOptions, useQuery } from 'react-query'

import { useWatchAll } from '../hooks'
import { contextOptions } from './contextOptions'

const queryKey = 'context'
const queryFn = () => makeEdgeContext(contextOptions)

export const useEdgeContext = ({
  watch,
  queryOptions,
}: {
  watch?: readonly (keyof EdgeContext)[]
  queryOptions?: UseQueryOptions<EdgeContext>
} = {}) => {
  const { data: context } = useQuery(queryKey, queryFn, {
    suspense: true,
    cacheTime: Infinity,
    staleTime: Infinity,
    ...queryOptions,
  })

  useWatchAll(context, watch)

  return context!
}
