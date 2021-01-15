import { EdgeAccount } from 'edge-core-js'
import { UseMutationOptions, UseQueryOptions, useMutation, useQuery } from 'react-query'

import { useWatch } from './watch'
import { useInvalidateQueries } from '.'

export const useOtpEnabled = (account: EdgeAccount, queryOptions?: UseQueryOptions<boolean>) => {
  const { refetch, data } = useQuery({
    queryKey: [account.username, 'otpEnabled'],
    queryFn: () => Promise.resolve(!!account.otpKey),
    initialData: !!account.otpKey,
    ...queryOptions,
  })

  useWatch(account, 'otpKey', () => refetch())

  return data!
}

export const useEnableOTP = (account: EdgeAccount, mutationOptions?: UseMutationOptions) => {
  const queryFn = () => account.enableOtp()

  return useMutation(queryFn, {
    ...useInvalidateQueries([[account.username, 'otpEnabled']]),
    ...mutationOptions,
  }).mutate
}

export const useDisableOTP = (account: EdgeAccount, mutationOptions?: UseMutationOptions) => {
  const queryFn = () => account.disableOtp()

  return useMutation(queryFn, {
    ...useInvalidateQueries([[account.username, 'otpEnabled']]),
    ...mutationOptions,
  }).mutate
}

export const useOTP = (account: EdgeAccount) => {
  return {
    otpKey: account.otpKey,
    enabled: useOtpEnabled(account),
    enableOTP: useEnableOTP(account),
    disableOTP: useDisableOTP(account),
  }
}
