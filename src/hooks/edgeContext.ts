import { EdgeAccount, EdgeContext, EdgeLoginMessage } from 'edge-core-js'
import { UseMutationOptions, UseQueryOptions, useMutation, useQuery } from 'react-query'

import { useEdgeContext } from '../Edge/useEdgeContext'
import { useWatch } from './watch'
import { getDefaultFiatCurrencyCode } from '.'

export const getAccountsWithPinLogin = (context: EdgeContext) => {
  return context.localUsers.filter(({ pinLoginEnabled }) => pinLoginEnabled)
}

export const useAccountsWithPinLogin = () => {
  const context = useEdgeContext()
  useWatch(context, 'localUsers')

  return getAccountsWithPinLogin(context)
}

export const useLoginMessages = (username: string, queryOptions?: UseQueryOptions<EdgeLoginMessage[]>) => {
  const context = useEdgeContext()

  return (
    useQuery({
      queryKey: ['loginMessages'],
      queryFn: () => context.fetchLoginMessages(),
      ...queryOptions,
    }).data?.find((message) => message.username === username) ?? {
      loginId: '',
      otpResetPending: false,
      pendingVouchers: [],
      recovery2Corrupt: false,
      username,
    }
  )
}

export const useCreateAccount = (
  mutationOptions?: UseMutationOptions<
    EdgeAccount,
    unknown,
    { username: string; password?: string; pin?: string; otp?: string }
  >,
) => {
  const context = useEdgeContext()

  return useMutation(
    ({ username, password, pin, otp }) => context.createAccount({ username, password, pin, otp }),
    {
      onSuccess: bootstrap,
      ...mutationOptions,
    },
  )
}

export const useLoginWithPin = (
  mutationOptions?: UseMutationOptions<EdgeAccount, unknown, { username: string; pin: string }>,
) => {
  const context = useEdgeContext()

  return useMutation(({ username, pin }) => context.loginWithPIN(username, pin), {
    onSuccess: bootstrap,
    ...mutationOptions,
  })
}

export const useLoginWithPassword = (
  mutationOptions?: UseMutationOptions<EdgeAccount, unknown, { username: string; password: string }>,
) => {
  const context = useEdgeContext()

  return useMutation(
    ({ username, password }) => context.loginWithPassword(username, password),
    {
      onSuccess: bootstrap,
      ...mutationOptions,
    },
  )
}

export const useLoginWithKey = (
  mutationOptions?: UseMutationOptions<EdgeAccount, unknown, { username: string; loginKey: string }>,
) => {
  const context = useEdgeContext()

  return useMutation(
    ({ username, loginKey }) => context.loginWithKey(username, loginKey),
    {
      onSuccess: bootstrap,
      ...mutationOptions,
    },
  )
}

const bootstrap = async (account: EdgeAccount) => {
  await createDefaultWallets(account)
}

const createDefaultWallets = async (account: EdgeAccount) => {
  const defaultFiatCurrencyCode = await getDefaultFiatCurrencyCode(account)
  const options = { fiatCurrencyCode: defaultFiatCurrencyCode }

  if (!account.allKeys.find(({ type }) => type === 'wallet:bitcoin')) {
    console.log('Creating default wallet: Bitcoin')
    await account.createCurrencyWallet('wallet:bitcoin', { name: 'My Bitcoin Wallet', ...options })
  }
}
