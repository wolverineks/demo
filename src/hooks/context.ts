import { EdgeContext } from 'edge-core-js'
import { useQuery } from 'react-query'

export const useLoginMessages = ({ context, username }: { context: EdgeContext; username: string }) =>
  useQuery({
    queryKey: ['loginMessages', username],
    queryFn: () => context.fetchLoginMessages().then((loginMessages) => loginMessages[username] || []),
    config: { suspense: true, cacheTime: 0, staleTime: Infinity },
  }).data!
