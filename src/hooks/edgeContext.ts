import { EdgeAccount, EdgeContext, EdgeLoginMessages } from 'edge-core-js'
import { UseMutationOptions, UseQueryOptions, useMutation, useQuery } from 'react-query'

import { useWatch } from './watch'
import { getDefaultFiatCurrencyCode } from '.'

export const getAccountsWithPinLogin = (context: EdgeContext) => {
  return context.localUsers.filter(({ pinLoginEnabled }) => pinLoginEnabled)
}

export const useAccountsWithPinLogin = (context: EdgeContext) => {
  useWatch(context, 'localUsers')

  return getAccountsWithPinLogin(context)
}

export const useLoginMessages = (
  context: EdgeContext,
  username: string,
  queryOptions?: UseQueryOptions<EdgeLoginMessages>,
) => {
  return useQuery(['loginMessages'], () => context.fetchLoginMessages(), queryOptions).data![username]
}

export const useCreateAccount = (
  context: EdgeContext,
  mutationOptions?: UseMutationOptions<
    EdgeAccount,
    unknown,
    { username: string; password?: string; pin?: string; otp?: string }
  >,
) => {
  return useMutation(({ username, password, pin, otp }) => context.createAccount(username, password, pin, { otp }), {
    onSuccess: bootstrap,
    ...mutationOptions,
  })
}

export const useLoginWithPin = (
  context: EdgeContext,
  mutationOptions?: UseMutationOptions<EdgeAccount, unknown, { username: string; pin: string }>,
) => {
  return useMutation(({ username, pin }) => context.loginWithPIN(username, pin), {
    onSuccess: bootstrap,
    ...mutationOptions,
  })
}

export const useLoginWithPassword = (
  context: EdgeContext,
  mutationOptions?: UseMutationOptions<EdgeAccount, unknown, { username: string; password: string }>,
) => {
  return useMutation(({ username, password }) => context.loginWithPassword(username, password), {
    onSuccess: bootstrap,
    ...mutationOptions,
  })
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

  if (!account.allKeys.find(({ type }) => type === 'wallet:ethereum')) {
    console.log('Creating default wallet: Ethereum')
    await account.createCurrencyWallet('wallet:ethereum', { name: 'My Ethereum Wallet', ...options })
  }

  if (!account.allKeys.find(({ type }) => type === 'wallet:bitcoincash')) {
    console.log('Creating default wallet: Bitcoincash')
    await account.createCurrencyWallet('wallet:bitcoincash', { name: 'My Bitcoincash Wallet', ...options })
  }
}
