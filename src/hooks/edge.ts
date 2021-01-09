import {
  EdgeAccount,
  EdgeContext,
  EdgeCurrencyCodeOptions,
  EdgeCurrencyInfo,
  EdgeCurrencyWallet,
  EdgeDenomination,
  EdgeGetTransactionsOptions,
  EdgeLoginMessages,
  EdgeMetaToken,
  EdgeReceiveAddress,
  EdgeSpendInfo,
  EdgeTransaction,
  EdgeWalletState,
} from 'edge-core-js'
import { useOnNewTransactions } from 'edge-react-hooks'
import React from 'react'
import { UseMutationOptions, UseQueryOptions, useMutation, useQuery, useQueryClient } from 'react-query'

import { getFiatInfo } from '../Fiat/getFiatInfo'
import {
  denominatedToNative,
  exchangeToNative,
  getActiveInfos,
  getAvailableTokens,
  getExchangeDenomination,
  getInfo,
  getSortedCurrencyWallets,
  isUnique,
  nativeToDenominated,
  nativeToExchange,
} from '../utils'
import { useWatch, useWatchAll } from './watch'

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

export const useReadPinLoginEnabled = (
  context: EdgeContext,
  account: EdgeAccount,
  queryOptions?: UseQueryOptions<boolean>,
) => {
  return useQuery([account.username, 'pinLoginEnabled'], () => context.pinLoginEnabled(account.username), queryOptions)
}

export const useActiveInfos = (account: EdgeAccount) => {
  const queryFn = () => getActiveInfos(account)
  const queryKey = 'activeInfos'
  const { refetch, data } = useQuery(queryKey, queryFn, { suspense: true })

  React.useEffect(() => {
    const unsub = account.watch('currencyWallets', () => refetch())

    return () => {
      unsub()
    }
  }, [account, refetch])

  return data!
}

export const useWritePinLoginEnabled = (
  account: EdgeAccount,
  mutationOptions?: UseMutationOptions<string, unknown, boolean>,
) => {
  const queryClient = useQueryClient()
  const queryKey = [account.username, 'pinLoginEnabled']
  const mutation = (enableLogin: boolean) => account.changePin({ enableLogin })

  return useMutation(mutation, {
    onMutate: () => queryClient.cancelQueries(queryKey),
    onSettled: () => queryClient.invalidateQueries(queryKey),
    ...mutationOptions,
  })
}

export const usePinLoginEnabled = (context: EdgeContext, account: EdgeAccount) => {
  return [useReadPinLoginEnabled(context, account).data!, useWritePinLoginEnabled(account).mutate] as const
}

export const useEdgeAccountTotal = (account: EdgeAccount) => {
  const wallets = getSortedCurrencyWallets(account)
  const fiatCurrencyCode = useDefaultFiatCurrencyCode(account)[0]
  const displayDenomination = useDisplayDenomination(account, fiatCurrencyCode)[0]

  const getTotal = () =>
    Promise.all(
      wallets.map(({ balances }) =>
        Promise.all(
          Object.entries(balances).map(([currencyCode, nativeAmount]) => {
            const exchangeDenomination = getExchangeDenomination(account, currencyCode)
            const exchangeAmount = nativeToDenominated({
              nativeAmount: nativeAmount || String(0),
              denomination: exchangeDenomination,
            })

            return account.rateCache.convertCurrency(currencyCode, fiatCurrencyCode, Number(exchangeAmount))
          }),
        ),
      ),
    ).then((balances) => balances.flat().reduce((result, current) => result + current, 0))

  const { data, refetch } = useQuery({
    queryKey: [account.username, 'accountTotal'],
    queryFn: () => getTotal(),
    refetchInterval: 1000,
  })

  React.useEffect(() => {
    const unsub = account.rateCache.on('update', () => refetch())

    return () => {
      unsub()
    }
  })

  return { total: data!, denomination: displayDenomination }
}

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
  const queryClient = useQueryClient()
  const queryKey = [account.username, 'otpEnabled']
  const queryFn = () => account.enableOtp()

  return useMutation(queryFn, {
    onMutate: () => queryClient.cancelQueries(queryKey),
    onSettled: () => queryClient.invalidateQueries(queryKey),
    ...mutationOptions,
  }).mutate
}

export const useDisableOTP = (account: EdgeAccount, mutationOptions?: UseMutationOptions) => {
  const queryClient = useQueryClient()
  const queryKey = [account.username, 'otpEnabled']
  const queryFn = () => account.disableOtp()

  return useMutation(queryFn, {
    onMutate: () => queryClient.cancelQueries(queryKey),
    onSettled: () => queryClient.invalidateQueries(queryKey),
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

export const useChangeWalletStates = (account: EdgeAccount) => {
  const {
    mutate: changeWalletStates,
    ...rest
  } = useMutation(({ walletId, walletState }: { walletId: string; walletState: EdgeWalletState }) =>
    account.changeWalletStates({ [walletId]: walletState }),
  )

  return {
    activateWallet: React.useCallback(
      (walletId: string) => changeWalletStates({ walletId, walletState: { archived: false, deleted: false } }),
      [changeWalletStates],
    ),
    archiveWallet: React.useCallback(
      (walletId: string) => changeWalletStates({ walletId, walletState: { archived: true, deleted: false } }),
      [changeWalletStates],
    ),
    deleteWallet: React.useCallback(
      (walletId: string) => changeWalletStates({ walletId, walletState: { archived: false, deleted: true } }),
      [changeWalletStates],
    ),
    ...rest,
  }
}

export const useDisplayToNative = ({
  account,
  currencyCode,
  displayAmount,
}: {
  account: EdgeAccount
  currencyCode: string
  displayAmount: string
}) => {
  const denomination = useDisplayDenomination(account, currencyCode)[0]

  return denominatedToNative({ denomination, amount: displayAmount })
}

export const useNativeToDisplay = ({
  account,
  currencyCode,
  nativeAmount,
}: {
  account: EdgeAccount
  currencyCode: string
  nativeAmount: string
}) => {
  const denomination = useDisplayDenomination(account, currencyCode)[0]

  return nativeToDenominated({ denomination, nativeAmount })
}

export const useExchangeToDisplay = ({
  account,
  currencyCode,
  exchangeAmount,
}: {
  account: EdgeAccount
  currencyCode: string
  exchangeAmount: string
}) => {
  const nativeAmount = exchangeToNative({ account, currencyCode, exchangeAmount })

  return useNativeToDisplay({ account, currencyCode, nativeAmount })
}

export const useDisplayToExchange = ({
  account,
  currencyCode,
  displayAmount,
}: {
  account: EdgeAccount
  currencyCode: string
  displayAmount: string
}) => {
  const nativeAmount = useDisplayToNative({ account, displayAmount, currencyCode })
  const denomination = getExchangeDenomination(account, currencyCode)

  return nativeToDenominated({ denomination, nativeAmount })
}

export const useReadDefaultFiatCurrencyCode = (account: EdgeAccount, queryOptions?: UseQueryOptions<string>) => {
  const defaultFiatCurrencyCode = 'iso:USD'

  return useQuery({
    queryKey: [account.username, 'defaultFiatCurrencyCode'],
    queryFn: () =>
      account.dataStore
        .getItem('defaultFiatCurrencyCode', 'defaultFiatCurrencyCode.json')
        .then(JSON.parse)
        .catch(() => defaultFiatCurrencyCode) as Promise<string>,
    ...queryOptions,
  })
}

export const useWriteDefaultFiatCurrencyCode = (account: EdgeAccount) => {
  const queryClient = useQueryClient()
  const queryKey = [account.username, 'defaultFiatCurrencyCode']
  const queryFn = (currencyCode: string) =>
    account.dataStore.setItem('defaultFiatCurrencyCode', 'defaultFiatCurrencyCode.json', JSON.stringify(currencyCode))

  return useMutation(queryFn, {
    onMutate: () => queryClient.cancelQueries(queryKey),
    onSettled: () => queryClient.invalidateQueries(queryKey),
  })
}

export const useDefaultFiatCurrencyCode = (account: EdgeAccount) => {
  return [useReadDefaultFiatCurrencyCode(account).data!, useWriteDefaultFiatCurrencyCode(account).mutate] as const
}

export const useDefaultFiatInfo = (account: EdgeAccount) => {
  const currencyCode = useDefaultFiatCurrencyCode(account)[0]

  return getFiatInfo(currencyCode)
}

export const useReadDisplayDenominationMultiplier = (
  account: EdgeAccount,
  currencyInfo: EdgeCurrencyInfo | EdgeMetaToken,
  queryOptions?: UseQueryOptions<string | EdgeDenomination>,
) => {
  return useQuery({
    queryKey: [currencyInfo.currencyCode, 'displayDenominationMultiplier'],
    queryFn: () =>
      account.dataStore
        .getItem('displayDenominationMultiplier', currencyInfo.currencyCode)
        .catch(() => currencyInfo.denominations[0]),
    ...queryOptions,
  })
}

export const useWriteDisplayDenominationMultiplier = (
  account: EdgeAccount,
  currencyInfo: EdgeCurrencyInfo | EdgeMetaToken,
) => {
  const queryClient = useQueryClient()
  const queryKey = [currencyInfo.currencyCode, 'displayDenominationMultiplier']
  const queryFn = (displayDenominationMultiplier: string) =>
    account.dataStore.setItem('displayDenominationMultiplier', currencyInfo.currencyCode, displayDenominationMultiplier)

  return useMutation(queryFn, {
    onMutate: () => queryClient.cancelQueries(queryKey),
    onSettled: () => queryClient.invalidateQueries(queryKey),
  })
}

export const useDisplayDenominationMultiplier = (
  account: EdgeAccount,
  currencyInfo: EdgeCurrencyInfo | EdgeMetaToken,
) => {
  return [
    useReadDisplayDenominationMultiplier(account, currencyInfo).data,
    useWriteDisplayDenominationMultiplier(account, currencyInfo).mutate,
  ] as const
}

export const useDisplayDenomination = (account: EdgeAccount, currencyCode: string) => {
  const currencyInfo = getInfo(account, currencyCode)
  const [multiplier, write] = useDisplayDenominationMultiplier(account, currencyInfo)

  return [
    currencyInfo.denominations.find((denomination) => denomination.multiplier === multiplier) ||
      currencyInfo.denominations[0],
    React.useCallback((denomination: EdgeDenomination) => write(denomination.multiplier), [write]),
  ] as const
}

export const useDisplayAmount = ({
  account,
  nativeAmount,
  currencyCode,
}: {
  account: EdgeAccount
  nativeAmount: string
  currencyCode: string
}) => {
  const [denomination] = useDisplayDenomination(account, currencyCode)

  return {
    amount: nativeToDenominated({ denomination, nativeAmount }),
    denomination,
    ...denomination,
  }
}

export const useFiatAmount = (
  {
    account,
    nativeAmount,
    fromCurrencyCode,
    fiatCurrencyCode,
  }: {
    account: EdgeAccount
    nativeAmount: string
    fromCurrencyCode: string
    fiatCurrencyCode: string
  },
  queryOptions?: UseQueryOptions<number>,
) => {
  const exchangeAmount = nativeToExchange({
    account,
    currencyCode: fromCurrencyCode,
    nativeAmount,
  })

  const { data, refetch } = useQuery({
    queryKey: [{ fromCurrencyCode, fiatCurrencyCode, exchangeAmount }],
    queryFn: () => account.rateCache.convertCurrency(fromCurrencyCode, fiatCurrencyCode, Number(exchangeAmount)),
    ...queryOptions,
  })

  React.useEffect(() => {
    const unsub = account.rateCache.on('update', () => refetch())

    return () => {
      unsub()
    }
  }, [account.rateCache, exchangeAmount, fiatCurrencyCode, fromCurrencyCode, refetch])

  return data!
}

export const useInactiveWallets = (account: EdgeAccount) => {
  const [, rerender] = React.useState({})
  const queryCache = useQueryClient().getQueryCache()

  React.useEffect(() => {
    queryCache.subscribe((query) => query?.queryKey[1] === 'inactiveWallet' && rerender({}))
  }, [account, queryCache])

  return queryCache
    .findAll({ predicate: ({ queryKey }) => queryKey[1] === 'inactiveWallet' })
    .map((query) => query.state.data!)
    .filter(Boolean) as InactiveWallet[]
}

export const useReadInactiveWallet = (
  account: EdgeAccount,
  walletId: string,
  queryOptions?: UseQueryOptions<InactiveWallet>,
) => {
  return useQuery({
    queryKey: [walletId, 'inactiveWallet'],
    queryFn: () => account.dataStore.getItem('inactiveWallets', walletId).then(JSON.parse) as Promise<InactiveWallet>,
    ...queryOptions,
  }).data!
}

export const useWriteInactiveWallet = (account: EdgeAccount, wallet: EdgeCurrencyWallet) => {
  const { mutate: update } = useMutation(() =>
    account.dataStore.setItem('inactiveWallets', wallet.id, JSON.stringify(wallet)),
  )

  React.useEffect(() => {
    const unsubs = (Object.keys(wallet) as (keyof EdgeCurrencyWallet)[]).map((key) => wallet.watch(key, () => update()))

    update()

    return () => unsubs.forEach((unsub) => unsub())
  }, [account, wallet, update])
}

export type InactiveWallet = Pick<
  EdgeCurrencyWallet,
  | 'id'
  | 'type'
  | 'keys'
  | 'name'
  | 'fiatCurrencyCode'
  | 'currencyInfo'
  | 'balances'
  | 'blockHeight'
  | 'displayPrivateSeed'
  | 'displayPublicSeed'
  | 'publicWalletInfo'
  | 'syncRatio'
  | 'otherMethods'
>

export const useEdgeCurrencyWallet = (
  {
    account,
    walletId,
    watch,
  }: { account: EdgeAccount; walletId: string; watch?: readonly (keyof EdgeCurrencyWallet)[] },
  queryOptions?: UseQueryOptions<EdgeCurrencyWallet>,
) => {
  const { data: wallet } = useQuery({
    queryKey: [walletId, 'wallet'],
    queryFn: () => account.waitForCurrencyWallet(walletId),
    ...queryOptions,
  })

  if (!wallet) throw new Error(`404: wallet:${walletId} not found`)

  useWatchAll(wallet, watch)

  return wallet
}

export const useBalance = (wallet: EdgeCurrencyWallet, currencyCode: string) => {
  const waitForBalance = (wallet: EdgeCurrencyWallet, code: string): Promise<string> => {
    return wallet.balances[code] != null
      ? Promise.resolve(wallet.balances[code])
      : new Promise((resolve) => {
          const unsubscribe = wallet.watch('balances', (balances) => {
            if (balances[code] != null) {
              unsubscribe()
              resolve(balances[code])
            }
          })
        })
  }

  const { refetch, data } = useQuery({
    queryKey: [wallet.id, 'balance', currencyCode],
    queryFn: () => waitForBalance(wallet, currencyCode),
    enabled: !!wallet,
  })

  useWatch(wallet, 'balances', () => refetch())

  return data!
}

export const useWriteFiatCurrencyCode = (wallet: EdgeCurrencyWallet) => {
  return useMutation(wallet.setFiatCurrencyCode)
}

export const useFiatCurrencyCode = (wallet: EdgeCurrencyWallet) => {
  return [wallet.fiatCurrencyCode, useWriteFiatCurrencyCode(wallet).mutate] as const
}

export const useReceiveAddressAndEncodeUri = ({
  wallet,
  nativeAmount,
  options,
  queryOptions,
}: {
  wallet: EdgeCurrencyWallet
  nativeAmount: string
  options?: EdgeCurrencyCodeOptions
  queryOptions?: UseQueryOptions<{ receiveAddress: EdgeReceiveAddress; uri: string }>
}) => {
  return useQuery({
    queryKey: [wallet.id, 'receiveAddressAndEncodeUri', nativeAmount, options],
    queryFn: () => {
      const receiveAddress = wallet.getReceiveAddress({ currencyCode: options?.currencyCode })
      const uri = receiveAddress.then(({ publicAddress }) =>
        wallet.encodeUri({
          publicAddress,
          nativeAmount: nativeAmount || '0',
        }),
      )

      return Promise.all([receiveAddress, uri]).then(([receiveAddress, uri]) => ({ receiveAddress, uri }))
    },
    suspense: false,
    ...queryOptions,
  })
}

export const useEnabledTokens = (wallet: EdgeCurrencyWallet, queryOptions?: UseQueryOptions<string[]>) => {
  const queryFn = () =>
    wallet
      .getEnabledTokens()
      // WTF? Why is the parent currencyCode in enabledTokens?
      .then((tokens) => tokens.filter((tokenCode) => tokenCode !== wallet.currencyInfo.currencyCode))
  const queryKey = [wallet.id, 'enabledTokens']

  return useQuery(queryKey, queryFn, {
    suspense: true,
    ...queryOptions,
  }).data!
}

export const useEnableToken = (wallet: EdgeCurrencyWallet) => {
  const queryFn = (tokenCurrencyCode: string) => wallet.enableTokens([tokenCurrencyCode])
  const queryClient = useQueryClient()
  const queryKey = [wallet.id, 'enabledTokens']

  return useMutation(queryFn, {
    onMutate: () => queryClient.cancelQueries(queryKey),
    onSettled: () => {
      queryClient.invalidateQueries('activeInfos')
      queryClient.invalidateQueries(queryKey)
    },
  }).mutate
}

export const useDisableToken = (wallet: EdgeCurrencyWallet) => {
  const queryFn = (tokenCurrencyCode: string) => wallet.disableTokens([tokenCurrencyCode])
  const queryClient = useQueryClient()
  const queryKey = [wallet.id, 'enabledTokens']

  return useMutation(queryFn, {
    onMutate: () => queryClient.cancelQueries(queryKey),
    onSettled: () => {
      queryClient.invalidateQueries('activeInfos')
      queryClient.invalidateQueries(queryKey)
    },
  }).mutate
}

export const useTokens = (wallet: EdgeCurrencyWallet) => ({
  availableTokens: getAvailableTokens(wallet),
  enabledTokens: useEnabledTokens(wallet),
  enableToken: useEnableToken(wallet),
  disableToken: useDisableToken(wallet),
})

export const useTransactions = (
  wallet: EdgeCurrencyWallet,
  options?: EdgeGetTransactionsOptions,
  queryOptions?: UseQueryOptions<EdgeTransaction[]>,
) => {
  const { data, refetch } = useQuery({
    queryKey: [wallet.id, 'transactions', options],
    queryFn: () => wallet.getTransactions(options),
    ...queryOptions,
  })

  useOnNewTransactions(
    wallet,
    React.useCallback(() => refetch(), [refetch]),
  )

  return data!
}

export const useTransactionCount = (
  wallet: EdgeCurrencyWallet,
  options?: EdgeGetTransactionsOptions,
  queryOptions?: UseQueryOptions<number>,
) => {
  const { data, refetch } = useQuery({
    queryKey: [wallet.id, 'transactionCount', options],
    queryFn: () => wallet.getNumTransactions(options),
    suspense: false,
    ...queryOptions,
  })

  useOnNewTransactions(
    wallet,
    React.useCallback(() => refetch(), [refetch]),
  )

  return data!
}

export const useMaxSpendable = (
  wallet: EdgeCurrencyWallet,
  spendInfo: EdgeSpendInfo,
  queryOptions?: UseQueryOptions<string>,
) => {
  return useQuery({
    queryKey: [wallet.id, 'maxSpendable', spendInfo],
    queryFn: () => wallet.getMaxSpendable(spendInfo),
    suspense: false,
    ...queryOptions,
  })
}

export const useMaxTransaction = (
  wallet: EdgeCurrencyWallet,
  spendInfo: EdgeSpendInfo,
  queryOptions?: UseQueryOptions<EdgeTransaction>,
) => {
  return useQuery({
    queryKey: [wallet.id, 'maxSpendableTransaction', spendInfo],
    queryFn: async () => {
      const maxSpendable = await wallet.getMaxSpendable(spendInfo)
      const spendTargets = [{ ...spendInfo.spendTargets[0], nativeAmount: maxSpendable }]
      const maxSpendInfo = { ...spendInfo, spendTargets }

      return wallet.makeSpend(maxSpendInfo)
    },
    ...queryOptions,
  })
}

export const useNewTransaction = (
  wallet: EdgeCurrencyWallet,
  spendInfo: EdgeSpendInfo,
  queryOptions?: UseQueryOptions<EdgeTransaction>,
) => {
  return useQuery({
    queryKey: [wallet.id, 'transaction', spendInfo],
    queryFn: () => wallet.makeSpend(spendInfo),
    suspense: false,
    ...queryOptions,
  })
}
