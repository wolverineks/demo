import { makeEdgeContext } from 'edge-core-js'
import { useQuery } from 'react-query'

import { contextOptions } from './contextOptions'

export const useEdgeContext = () =>
  useQuery({
    queryKey: 'context',
    queryFn: () => makeEdgeContext(contextOptions),
    config: { suspense: true, cacheTime: 0, staleTime: Infinity },
  }).data!
