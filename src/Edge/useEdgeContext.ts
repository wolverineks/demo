import { EdgeContext, makeEdgeContext } from 'edge-core-js'
import { QueryConfig, useQuery } from 'react-query'

import { useWatchAll } from '../hooks'
import { contextOptions } from './contextOptions'

export const useEdgeContext = (config?: QueryConfig<EdgeContext>, watch?: readonly (keyof EdgeContext)[]) => {
  const { data: context } = useQuery({
    queryKey: 'context',
    queryFn: () => makeEdgeContext(contextOptions),
    config: { suspense: true, cacheTime: 0, staleTime: Infinity, ...config },
  })

  useWatchAll(context, watch)

  return context!
}
