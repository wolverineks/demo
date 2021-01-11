import { Disklet } from 'disklet'
import { useQuery, useQueryClient } from 'react-query'

export const useFile = <FileType>(
  storage: Disklet,
  {
    path,
    parse = JSON.parse,
    queryKey,
  }: { path: string; parse?: (string: string) => FileType; queryKey: string | string[] },
) => {
  const queryFn = () => storage.getText(path).then(parse)

  return useQuery(queryKey, queryFn, { suspense: true, staleTime: 0 })
}

export const usePrefetchFile = <FileType>(
  storage: Disklet,
  {
    path,
    parse = JSON.parse,
    queryKey,
  }: { path: string; parse?: (string: string) => FileType; queryKey: string | string[] },
) => {
  const queryClient = useQueryClient()
  const queryFn = () => storage.getText(path).then(parse)

  return () => queryClient.prefetchQuery(queryKey, queryFn, { staleTime: 0 })
}
