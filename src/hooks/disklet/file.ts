import { Disklet } from 'disklet'
import { FetchQueryOptions, UseQueryOptions, useQuery, useQueryClient } from 'react-query'

export const useFile = <FileType>(
  {
    disklet,
    path,
    parse = JSON.parse,
    queryKey,
  }: {
    disklet: Disklet
    path: string
    parse?: (string: string) => FileType
    queryKey: string | string[]
  },
  queryOptions?: UseQueryOptions,
) => {
  const queryFn = () => disklet.getText(path).then(parse)

  return useQuery(queryKey, queryFn, {
    suspense: true,
    staleTime: 0,
    ...queryOptions,
  })
}

export const usePrefetchFile = <FileType>(
  {
    disklet,
    path,
    parse = JSON.parse,
    queryKey,
  }: {
    disklet: Disklet
    path: string
    parse?: (string: string) => FileType
    queryKey: string | string[]
  },
  queryOptions?: FetchQueryOptions,
) => {
  const queryClient = useQueryClient()
  const queryFn = () => disklet.getText(path).then(parse)

  return () =>
    queryClient.prefetchQuery(queryKey, queryFn, {
      staleTime: 0,
      ...queryOptions,
    })
}
