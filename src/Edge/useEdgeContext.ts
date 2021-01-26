import { EdgeContext, makeEdgeContext } from 'edge-core-js'
import { UseQueryOptions, useQuery } from 'react-query'

import { contextOptions } from './contextOptions'

const queryKey = 'context'
const queryFn = () => makeEdgeContext(contextOptions)

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
