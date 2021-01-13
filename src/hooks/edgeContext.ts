import { EdgeAccount, EdgeContext, EdgeLoginMessages } from 'edge-core-js'
import { UseMutationOptions, UseQueryOptions, useMutation, useQuery } from 'react-query'

export const useLoginMessages = (
  context: EdgeContext,
  username: string,
  queryOptions?: UseQueryOptions<EdgeLoginMessages>,
) => {
  return useQuery(['loginMessages'], () => context.fetchLoginMessages(), queryOptions).data![username]
}

export const useCreateAccount = (context: EdgeContext) => {
  return useMutation(
    ({ username, password, pin, otp }: { username: string; password: string; pin: string; otp: string }) =>
      context.createAccount(username, password, pin, { otp }),
  )
}

export const useLoginWithPin = (
  context: EdgeContext,
  mutationOptions?: UseMutationOptions<EdgeAccount, unknown, { username: string; pin: string }>,
) => {
  return useMutation(({ username, pin }) => context.loginWithPIN(username, pin), mutationOptions)
}

export const useLoginWithPassword = (
  context: EdgeContext,
  mutationOptions?: UseMutationOptions<EdgeAccount, unknown, { username: string; password: string }>,
) => {
  return useMutation(({ username, password }) => context.loginWithPassword(username, password), mutationOptions)
}
