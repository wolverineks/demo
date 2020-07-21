import { AnyQueryKey, MutationOptions, queryCache } from 'react-query'

const identity = (x: any) => x

export const optimisticMutationOptions = <T, U, R = void>(
  queryKey: string | AnyQueryKey,
  updater: (value: T, previous: U | undefined) => U = identity,
): MutationOptions<R, T> => ({
  onMutate: (value) => {
    queryCache.cancelQueries(queryKey)
    const previous = queryCache.getQueryData<U>(queryKey)
    queryCache.setQueryData(queryKey, updater(value, previous))
    const rollback = () => queryCache.setQueryData(queryKey, previous)

    return rollback
  },
  onError: (_err, _attemptedValue, rollback) => (rollback as any)(),
  onSettled: () => queryCache.invalidateQueries(queryKey),
})
