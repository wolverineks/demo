import { EdgeAccount, EdgeContext } from 'edge-core-js'
import { queryCache, useMutation, useQuery } from 'react-query'

const queryKey = ({ account }: { account: EdgeAccount }) => ['pinLoginEnabled', account.username] as const // FIXME

export const useReadPinLoginEnabled = ({ context, account }: { context: EdgeContext; account: EdgeAccount }) =>
  useQuery({
    queryKey: queryKey({ account }),
    queryFn: () => context.pinLoginEnabled(account.username),
    config: { suspense: true },
  })

export const useWritePinLoginEnabled = ({ account }: { account: EdgeAccount }) =>
  useMutation((enabled: boolean) => account.changePin({ enableLogin: enabled }), {
    onMutate: (enabled: boolean) => {
      queryCache.cancelQueries(queryKey({ account }))
      const previous = queryCache.getQueryData(queryKey({ account }))
      queryCache.setQueryData(queryKey({ account }), enabled)
      const rollback = () => queryCache.setQueryData(queryKey({ account }), previous)

      return rollback
    },
    onError: (_err, _attemptedValue, rollback) => rollback(),
    onSettled: () => queryCache.invalidateQueries(queryKey({ account })),
  })

export const usePinLoginEnabled = ({ context, account }: { context: EdgeContext; account: EdgeAccount }) =>
  [useReadPinLoginEnabled({ context, account }).data!, useWritePinLoginEnabled({ account })[0]] as const
