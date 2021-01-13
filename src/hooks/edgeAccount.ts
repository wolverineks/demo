import {
  EdgeAccount,
  EdgeContext,
  EdgeCreateCurrencyWalletOptions,
  EdgeCurrencyInfo,
  EdgeCurrencyWallet,
  EdgeDenomination,
  EdgeMetaToken,
  EdgeWalletState,
} from 'edge-core-js'
import React from 'react'
import { UseMutationOptions, UseQueryOptions, useMutation, useQuery, useQueryClient } from 'react-query'

import {
  FiatInfo,
  denominatedToNative,
  exchangeToNative,
  getActiveInfos,
  getExchangeDenomination,
  getFiatInfo,
  getInfo,
  getSortedCurrencyWallets,
  nativeToDenominated,
  nativeToExchange,
} from '../utils'
import { useWatch, useWatchAll } from './watch'

export const usePinExists = (context: EdgeContext, account: EdgeAccount, queryOptions?: UseQueryOptions<boolean>) => {
  const queryKey = [account.username, 'pinExists']
  const queryFn = () => context.pinExists(account.username)

  return useQuery(queryKey, queryFn, { staleTime: 0, ...queryOptions })
}

export const usePinLoginEnabled = (
  context: EdgeContext,
  account: EdgeAccount,
  queryOptions?: UseQueryOptions<boolean>,
) => {
  const queryKey = [account.username, 'pinLoginEnabled']
  const queryFn = () => context.pinLoginEnabled(account.username)

  return useQuery(queryKey, queryFn, {
    staleTime: 0,
    ...queryOptions,
  })
}

export const useChangePinLogin = (
  context: EdgeContext,
  account: EdgeAccount,
  mutationOptions?: UseMutationOptions<string, unknown, boolean, { previous: boolean }>,
) => {
  const queryClient = useQueryClient()
  const queryKey = [account.username, 'pinLoginEnabled']
  const mutation = (enabled: boolean) => account.changePin({ enableLogin: enabled })

  return useMutation<string, unknown, boolean, { previous: boolean }>(mutation, {
    onMutate: async () => {
      queryClient.cancelQueries(queryKey)
      const previous = await context.pinLoginEnabled(account.username)
      queryClient.setQueryData(queryKey, (current) => !current)

      return { previous }
    },
    onError: (_error, _newEnabled, context) => {
      if (context) {
        queryClient.setQueryData(queryKey, context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries(queryKey)
    },
    ...mutationOptions,
  })
}

export const useChangePin = (account: EdgeAccount, mutationOptions?: UseMutationOptions<string, unknown, string>) => {
  const mutation = (pin: string) => account.changePin({ pin })

  return useMutation<string, unknown, string>(mutation, mutationOptions)
}

export const useCheckPin = (account: EdgeAccount) => {
  return useMutation(account.checkPin)
}

export const useDeletePin = (account: EdgeAccount) => {
  return useMutation(account.deletePin)
}

export const usePin = (context: EdgeContext, account: EdgeAccount) => {
  return {
    pinExists: usePinExists(context, account).data!,
    pinLoginEnabled: usePinLoginEnabled(context, account).data!,
    changePinLogin: useChangePinLogin(context, account),
    changePin: useChangePin(account),
    deletePin: useDeletePin(account),
    checkPin: useCheckPin(account),
  }
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

export const useCreateCurrencyWallet = (account: EdgeAccount) => {
  const mutationFn = ({ type, options }: { type: string; options: EdgeCreateCurrencyWalletOptions }) =>
    account.createCurrencyWallet(type, options)

  return useMutation(mutationFn)
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

export const useInactiveWallets = (account: EdgeAccount) => {
  const [, rerender] = React.useState({})
  const queryCache = useQueryClient().getQueryCache()

  React.useEffect(() => {
    const unsub = queryCache.subscribe((query) => query?.queryKey[1] === 'inactiveWallet' && rerender({}))

    return () => {
      unsub()
    }
  }, [account, queryCache])

  return queryCache
    .findAll({ predicate: ({ queryKey }) => queryKey[1] === 'inactiveWallet' })
    .map((query) => query.state.data)
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

export const useReadDisplayDenominationMultiplier = (
  account: EdgeAccount,
  currencyInfo: EdgeCurrencyInfo | EdgeMetaToken | FiatInfo,
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
  currencyInfo: EdgeCurrencyInfo | EdgeMetaToken | FiatInfo,
) => {
  const queryClient = useQueryClient()
  const queryKey = [currencyInfo.currencyCode, 'displayDenominationMultiplier']
  const queryFn = (displayDenominationMultiplier: string) =>
    account.dataStore.setItem('displayDenominationMultiplier', currencyInfo.currencyCode, displayDenominationMultiplier)

  return useMutation(queryFn, {
    onMutate: () => {
      queryClient.cancelQueries(queryKey)
      queryClient.cancelQueries(['displayDenominationMultiplier', currencyInfo.currencyCode]) // invalidate dataStore
    },
    onSettled: () => {
      queryClient.invalidateQueries(queryKey)
      queryClient.invalidateQueries(['displayDenominationMultiplier', currencyInfo.currencyCode]) // invalidate dataStore
    },
  })
}

export const useDisplayDenominationMultiplier = (
  account: EdgeAccount,
  currencyInfo: EdgeCurrencyInfo | EdgeMetaToken | FiatInfo,
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
