import { useQueryClient } from 'react-query'

export const useInvalidateQueries = (queryKeys: string[][]) => {
  const queryClient = useQueryClient()

  return {
    onMutate: () => queryKeys.forEach((key) => queryClient.cancelQueries(key)),
    onSettled: () => queryKeys.forEach((key) => queryClient.invalidateQueries(key)),
  }
}
