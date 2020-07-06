import { AnyQueryKey, MutationOptions, queryCache } from 'react-query'

export const optimisticMutationOptions = <T, R = void>(queryKey: string | AnyQueryKey): MutationOptions<R, T> => ({
  onMutate: (value) => {
    queryCache.cancelQueries(queryKey)
    const previous = queryCache.getQueryData(queryKey)
    queryCache.setQueryData(queryKey, value)
    const rollback = () => queryCache.setQueryData(queryKey, previous)

    return rollback
  },
  onError: (_err, _attemptedValue, rollback) => rollback(),
  onSettled: () => queryCache.invalidateQueries(queryKey),
})
