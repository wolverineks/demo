import { Disklet } from 'disklet'
import { useQuery, useQueryClient } from 'react-query'

export const useFolder = (storage: Disklet, { path, queryKey }: { path: string; queryKey?: string | string[] }) => {
  const queryFn = () => storage.list(path)

  return useQuery(queryKey || path, queryFn, { suspense: true, staleTime: 0 })
}

export const usePrefetchFolder = (
  storage: Disklet,
  { path, queryKey }: { path: string; queryKey?: string | string[] },
) => {
  const queryClient = useQueryClient()
  const queryFn = () => storage.list(path)

  return () => queryClient.prefetchQuery(queryKey || path, queryFn, { staleTime: 0 })
}
