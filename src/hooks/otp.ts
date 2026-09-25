import { UseMutationOptions, UseQueryOptions, useMutation, useQuery } from 'react-query'

import { useEdgeAccount } from '../auth'
import { useWatch } from './watch'
import { useInvalidateQueries } from '.'

export const useOtpEnabled = (queryOptions?: UseQueryOptions<boolean>) => {
  const account = useEdgeAccount()
  const { refetch, data } = useQuery({
    queryKey: [account.username, 'otpEnabled'],
    queryFn: () => Promise.resolve(!!account.otpKey),
    initialData: !!account.otpKey,
    ...queryOptions,
  })

  useWatch(account, 'otpKey', () => refetch())

  return data!
}

export const useEnableOTP = (mutationOptions?: UseMutationOptions) => {
  const account = useEdgeAccount()
  const queryFn = () => account.enableOtp()

  return useMutation(queryFn, {
    ...useInvalidateQueries([[account.username, 'otpEnabled']]),
    ...mutationOptions,
  }).mutate
}

export const useDisableOTP = (mutationOptions?: UseMutationOptions) => {
  const account = useEdgeAccount()
  const queryFn = () => account.disableOtp()

  return useMutation(queryFn, {
    ...useInvalidateQueries([[account.username, 'otpEnabled']]),
    ...mutationOptions,
  }).mutate
}

export const useOTP = () => {
  const account = useEdgeAccount()

  return {
    otpKey: account.otpKey,
    enabled: useOtpEnabled(),
    enableOTP: useEnableOTP(),
    disableOTP: useDisableOTP(),
  }
}
