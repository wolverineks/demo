import { EdgeContext, makeEdgeContext } from 'edge-core-js'
import { QueryConfig, useQuery } from 'react-query'

import { contextOptions } from './contextOptions'

export const useEdgeContext = (config?: QueryConfig<EdgeContext>) =>
  useQuery({
    queryKey: 'context',
    queryFn: () => makeEdgeContext(contextOptions),
    config: { suspense: true, cacheTime: 0, staleTime: Infinity, ...config },
  }).data!
