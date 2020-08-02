import { MutationConfig, QueryKey, queryCache } from 'react-query'

const identity = (x: any) => x

export const optimisticMutationOptions = <TVariables, TSnapshot, TResult = void>(
  queryKey: QueryKey,
  updater: (variables: TVariables, snapshot: TSnapshot | undefined) => TSnapshot = identity,
): MutationConfig<TResult, Error, TVariables, TSnapshot> => ({
  onMutate: (variables: TVariables) => {
    queryCache.cancelQueries(queryKey)

    const snapshot = queryCache.getQueryData<TSnapshot>(queryKey)
    queryCache.setQueryData(queryKey, updater(variables, snapshot))

    return snapshot!
  },
  onError: (_err, _variables, snapshot) => queryCache.setQueryData(queryKey, snapshot),
  onSettled: () => queryCache.invalidateQueries(queryKey),
})
