import { EdgeAccount, EdgeContext } from 'edge-core-js'
import { useMutation, useQuery } from 'react-query'

import { optimisticMutationOptions } from './optimisticMutationOptions'

const queryKey = ({ account }: { account: EdgeAccount }) => ['pinLoginEnabled', account.username] as const // FIXME

export const useReadPinLoginEnabled = ({ context, account }: { context: EdgeContext; account: EdgeAccount }) =>
  useQuery({
    queryKey: queryKey({ account }),
    queryFn: () => context.pinLoginEnabled(account.username),
    config: { suspense: true },
  })

export const useWritePinLoginEnabled = ({ account }: { account: EdgeAccount }) =>
  useMutation(
    (enabled: boolean) => account.changePin({ enableLogin: enabled }),
    optimisticMutationOptions(queryKey({ account })),
  )

export const usePinLoginEnabled = ({ context, account }: { context: EdgeContext; account: EdgeAccount }) =>
  [useReadPinLoginEnabled({ context, account }).data!, useWritePinLoginEnabled({ account })[0]] as const
