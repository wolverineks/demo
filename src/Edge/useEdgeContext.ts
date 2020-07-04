import { makeEdgeContext } from 'edge-core-js'
import { useWatchAll } from 'edge-react-hooks'
import { useQuery } from 'react-query'

import { contextOptions } from './contextOptions'

export const useEdgeContext = () => {
  const context = useQuery({
    queryKey: 'context',
    queryFn: () => makeEdgeContext(contextOptions),
    config: { suspense: true },
  }).data!

  useWatchAll(context)

  return context
}
