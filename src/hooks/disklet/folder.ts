import { Disklet, DiskletListing } from 'disklet'
import { FetchQueryOptions, UseQueryOptions, useQuery, useQueryClient } from 'react-query'

export const useFolder = (
  {
    disklet,
    path,
    queryKey,
  }: {
    disklet: Disklet
    path: string
    queryKey?: string | string[]
  },
  queryOptions?: UseQueryOptions<DiskletListing>,
) => {
  const queryFn = () => disklet.list(path)

  return useQuery(queryKey || path, queryFn, {
    suspense: true,
    staleTime: 0,
    ...queryOptions,
  })
}

export const usePrefetchFolder = (
  {
    disklet,
    path,
    queryKey,
  }: {
    disklet: Disklet
    path: string
    queryKey?: string | string[]
  },
  queryOptions?: FetchQueryOptions,
) => {
  const queryClient = useQueryClient()
  const queryFn = () => disklet.list(path)

  return () =>
    queryClient.prefetchQuery(queryKey || path, queryFn, {
      staleTime: 0,
      ...queryOptions,
    })
}
