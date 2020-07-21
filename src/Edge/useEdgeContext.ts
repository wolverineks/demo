import { makeEdgeContext } from 'edge-core-js'
import { useQuery } from 'react-query'

import { contextOptions } from './contextOptions'

export const useEdgeContext = () => {
  const context = useQuery({
    queryKey: 'context',
    queryFn: () => makeEdgeContext(contextOptions),
    config: { suspense: true, cacheTime: 0, staleTime: Infinity },
  })

  return context.data!
}
