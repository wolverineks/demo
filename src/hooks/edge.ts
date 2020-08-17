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
import { MutationConfig, QueryConfig, queryCache, useMutation, useQuery } from 'react-query'

import { getFiatInfo } from '../Fiat/getFiatInfo'
import {
  denominatedToNative,
  exchangeToNative,
  getActiveInfos,
  getAvailableTokens,
  getExchangeDenomination,
  getInfo,
  getSortedCurrencyWallets,
  getTokenInfo,
  isUnique,
  nativeToDenominated,
} from '../utils'
import { optimisticMutationOptions } from './optimisticMutationOptions'
import { useWatch, useWatchAll } from './watch'

export const useLoginMessages = (context: EdgeContext, username: string, config?: QueryConfig<EdgeLoginMessages>) => {
  return useQuery({
    queryKey: ['loginMessages'],
    queryFn: () => context.fetchLoginMessages(),
    config: { ...config },
  }).data![username]
}

export const useCreateAccount = (context: EdgeContext) => {
  return useMutation(
    ({ username, password, pin, otp }: { username: string; password: string; pin: string; otp: string }) =>
      context.createAccount(username, password, pin, { otp }),
  )
}

export const useLoginWithPin = (
  context: EdgeContext,
  config?: MutationConfig<EdgeAccount, unknown, { username: string; pin: string }>,
) => {
  return useMutation(
    ({ username, pin }: { username: string; pin: string }) => context.loginWithPIN(username, pin),
    config,
  )
}

export const useLoginWithPassword = (
  context: EdgeContext,
  config?: MutationConfig<EdgeAccount, unknown, { username: string; password: string }>,
) => {
  return useMutation(
    ({ username, password }: { username: string; password: string }) => context.loginWithPassword(username, password),
    config,
  )
}

export const useReadPinLoginEnabled = (context: EdgeContext, account: EdgeAccount, config?: QueryConfig<boolean>) => {
  return useQuery({
    queryKey: [account.username, 'pinLoginEnabled'],
    queryFn: () => context.pinLoginEnabled(account.username),
    config: { ...config },
  })
}

export const useActiveInfos = (account: EdgeAccount) => {
  const [, rerender] = React.useState({})

  React.useEffect(() => {
    const unsubs = getSortedCurrencyWallets(account).map((wallet) => wallet.watch('balances', () => rerender({})))

    return () => {
      unsubs.forEach((unsub) => unsub())
    }
  })

  return getActiveInfos(account)
}

export const useActiveTokenInfos = (account: EdgeAccount) => {
  const [, rerender] = React.useState({})
  const wallets = getSortedCurrencyWallets(account)

  React.useEffect(() => {
    wallets.forEach((wallet) => {
      const query = queryCache.getQuery([wallet.id, 'enabledTokens'])

      const subscription = query?.subscribe(() => rerender({}))

      return subscription?.unsubscribe
    })
  }, [wallets])

  return wallets
    .map((wallet) => queryCache.getQueryData([wallet.id, 'enabledTokens']) as string[])
    .reduce((result, current = []) => [...result, ...current], [])
    .filter(isUnique)
    .map((currencyCode) => getTokenInfo(account, currencyCode))
}

export const useWritePinLoginEnabled = (account: EdgeAccount) => {
  return useMutation(
    (enableLogin: boolean) => account.changePin({ enableLogin }),
    optimisticMutationOptions([account.username, 'pinLoginEnabled'], (enableLogin) => enableLogin),
  )
}

export const usePinLoginEnabled = (context: EdgeContext, account: EdgeAccount) => {
  return [useReadPinLoginEnabled(context, account).data!, useWritePinLoginEnabled(account)[0]] as const
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
    config: { refetchInterval: 1000 },
  })

  React.useEffect(() => {
    const unsub = account.rateCache.on('update', () => refetch())

    return () => {
      unsub()
    }
  })

  return { total: data!, denomination: displayDenomination }
}

export const useOtpEnabled = (account: EdgeAccount, config?: QueryConfig<boolean>) => {
  const { refetch, data } = useQuery({
    queryKey: [account.username, 'otpEnabled'],
    queryFn: () => Promise.resolve(!!account.otpKey),
    config: { initialData: !!account.otpKey, ...config },
  })

  useWatch(account, 'otpKey', refetch)

  return data!
}

export const useOTP = (account: EdgeAccount) => ({
  otpKey: account.otpKey,
  enabled: useOtpEnabled(account),
  enableOTP: useMutation(
    account.enableOtp,
    optimisticMutationOptions([account.username, 'otpEnabled'], () => true),
  )[0],
  disableOTP: useMutation(
    account.disableOtp,
    optimisticMutationOptions([account.username, 'otpEnabled'], () => false),
  )[0],
})

export const useChangeWalletStates = (account: EdgeAccount) => {
  const [
    changeWalletStates,
    rest,
  ] = useMutation(({ walletId, walletState }: { walletId: string; walletState: EdgeWalletState }) =>
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

export const useLoginMethod = (account: EdgeAccount) => {
  const unknownLogin = () => {
    throw new Error('unknown login')
  }

  return account.pinLogin
    ? 'pinLogin'
    : account.passwordLogin
    ? 'passwordLogin'
    : account.newAccount
    ? 'newAccount'
    : account.keyLogin
    ? 'keyLogin'
    : account.recoveryLogin
    ? 'recoveryLogin'
    : account.edgeLogin
    ? 'edgeLogin'
    : unknownLogin()
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

export const useReadDefaultFiatCurrencyCode = (account: EdgeAccount, config?: QueryConfig<string>) => {
  const defaultFiatCurrencyCode = 'iso:USD'

  return useQuery({
    queryKey: [account.username, 'defaultFiatCurrencyCode'],
    queryFn: () =>
      account.dataStore
        .getItem('defaultFiatCurrencyCode', 'defaultFiatCurrencyCode.json')
        .then(JSON.parse)
        .catch(() => defaultFiatCurrencyCode) as Promise<string>,
    config: { ...config },
  })
}

export const useWriteDefaultFiatCurrencyCode = (account: EdgeAccount) => {
  return useMutation(
    (currencyCode: string) =>
      account.dataStore.setItem(
        'defaultFiatCurrencyCode',
        'defaultFiatCurrencyCode.json',
        JSON.stringify(currencyCode),
      ),
    optimisticMutationOptions([account.username, 'defaultFiatCurrencyCode']),
  )
}

export const useDefaultFiatCurrencyCode = (account: EdgeAccount) => {
  return [useReadDefaultFiatCurrencyCode(account).data!, useWriteDefaultFiatCurrencyCode(account)[0]] as const
}

export const useDefaultFiatInfo = (account: EdgeAccount) => {
  const currencyCode = useDefaultFiatCurrencyCode(account)[0]

  return getFiatInfo(currencyCode)
}

export const useReadDisplayDenominationMultiplier = (
  account: EdgeAccount,
  currencyInfo: EdgeCurrencyInfo | EdgeMetaToken,
  config?: QueryConfig<string | EdgeDenomination>,
) => {
  return useQuery({
    queryKey: [currencyInfo.currencyCode, 'displayDenominationMultiplier'],
    queryFn: () =>
      account.dataStore
        .getItem('displayDenominationMultiplier', currencyInfo.currencyCode)
        .catch(() => currencyInfo.denominations[0]),
    config: { ...config },
  })
}

export const useWriteDisplayDenominationMultiplier = (
  account: EdgeAccount,
  currencyInfo: EdgeCurrencyInfo | EdgeMetaToken,
) => {
  return useMutation(
    (displayDenominationMultiplier: string) =>
      account.dataStore.setItem(
        'displayDenominationMultiplier',
        currencyInfo.currencyCode,
        displayDenominationMultiplier,
      ),
    optimisticMutationOptions([currencyInfo.currencyCode, 'displayDenominationMultiplier']),
  )
}

export const useDisplayDenominationMultiplier = (
  account: EdgeAccount,
  currencyInfo: EdgeCurrencyInfo | EdgeMetaToken,
) => {
  return [
    useReadDisplayDenominationMultiplier(account, currencyInfo).data,
    useWriteDisplayDenominationMultiplier(account, currencyInfo)[0],
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
  config?: QueryConfig<number>,
) => {
  const denomination = getExchangeDenomination(account, fromCurrencyCode)
  const exchangeAmount = Number(nativeToDenominated({ denomination, nativeAmount }))

  const { data, refetch } = useQuery({
    queryKey: [{ fromCurrencyCode, fiatCurrencyCode, exchangeAmount }],
    queryFn: () => account.rateCache.convertCurrency(fromCurrencyCode, fiatCurrencyCode, exchangeAmount),
    config: { ...config },
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
  React.useEffect(() => {
    queryCache.subscribe((_queryCache, query) => query?.queryKey[1] === 'inactiveWallet' && rerender({}))
  }, [account])

  return queryCache
    .getQueries<InactiveWallet>(({ queryKey }) => queryKey[1] === 'inactiveWallet')
    .map((query) => query.state.data!)
    .filter(Boolean)
}

export const useReadInactiveWallet = (account: EdgeAccount, walletId: string, config?: QueryConfig<InactiveWallet>) => {
  return useQuery({
    queryKey: [walletId, 'inactiveWallet'],
    queryFn: () => account.dataStore.getItem('inactiveWallets', walletId).then(JSON.parse) as Promise<InactiveWallet>,
    config: { ...config },
  }).data!
}

export const useWriteInactiveWallet = (account: EdgeAccount, wallet: EdgeCurrencyWallet) => {
  const [update] = useMutation(() => account.dataStore.setItem('inactiveWallets', wallet.id, JSON.stringify(wallet)))

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
  config?: QueryConfig<EdgeCurrencyWallet>,
) => {
  const { data: wallet } = useQuery({
    queryKey: [walletId, 'wallet'],
    queryFn: () => account.waitForCurrencyWallet(walletId),
    config: { ...config },
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
    queryKey: [wallet!.id, 'balance', currencyCode],
    queryFn: () => waitForBalance(wallet!, currencyCode),
    config: { enabled: !!wallet },
  })

  useWatch(wallet, 'balances', () => refetch())

  return data!
}

export const useWriteFiatCurrencyCode = (wallet: EdgeCurrencyWallet) => {
  return useMutation(wallet.setFiatCurrencyCode)
}

export const useFiatCurrencyCode = (wallet: EdgeCurrencyWallet) => {
  return [wallet.fiatCurrencyCode, useWriteFiatCurrencyCode(wallet)[0]] as const
}

export const useReceiveAddressAndEncodeUri = ({
  wallet,
  nativeAmount,
  options,
  config,
}: {
  wallet: EdgeCurrencyWallet
  nativeAmount: string
  options?: EdgeCurrencyCodeOptions
  config?: QueryConfig<{ receiveAddress: EdgeReceiveAddress; uri: string }>
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
    config: { suspense: false, ...config },
  })
}

export const useEnabledTokens = (wallet: EdgeCurrencyWallet, config?: QueryConfig<string[]>) => {
  return useQuery({
    queryKey: [wallet.id, 'enabledTokens'],
    queryFn: () =>
      wallet
        .getEnabledTokens()
        // WTF? Why is the parent currencyCode in enabledTokens?
        .then((tokens) => tokens.filter((tokenCode) => tokenCode !== wallet.currencyInfo.currencyCode)),
    config: { ...config },
  }).data!
}

export const useEnableToken = (wallet: EdgeCurrencyWallet) => {
  return useMutation(
    (tokenCurrencyCode: string) => wallet.enableTokens([tokenCurrencyCode]),
    optimisticMutationOptions([wallet.id, 'enabledTokens'], (tokenCurrencyCode: string, current: string[] = []) => [
      ...current,
      tokenCurrencyCode,
    ]),
  )[0]
}

export const useDisableToken = (wallet: EdgeCurrencyWallet) => {
  return useMutation(
    (tokenCurrencyCode: string) => wallet.disableTokens([tokenCurrencyCode]),
    optimisticMutationOptions([wallet.id, 'enabledTokens'], (tokenCurrencyCode: string, current: string[] = []) =>
      current.filter((currencyCode) => currencyCode !== tokenCurrencyCode),
    ),
  )[0]
}

export const useTokens = (wallet: EdgeCurrencyWallet) => ({
  availableTokens: getAvailableTokens(wallet),
  enabledTokens: useEnabledTokens(wallet),
  enableToken: useEnableToken(wallet),
  disableToken: useDisableToken(wallet),
})

export const useTransactions = (
  wallet: EdgeCurrencyWallet,
  options?: { currencyCode: string },
  config?: QueryConfig<EdgeTransaction[]>,
) => {
  const { data, refetch } = useQuery({
    queryKey: [wallet.id, 'transactions', options],
    queryFn: () => wallet.getTransactions(options),
    config: { ...config },
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
  config?: QueryConfig<number>,
) => {
  const { data, refetch } = useQuery({
    queryKey: [wallet.id, 'transactionCount', options],
    queryFn: () => wallet.getNumTransactions(options),
    config: { suspense: false, ...config },
  })

  useOnNewTransactions(
    wallet,
    React.useCallback(() => refetch(), [refetch]),
  )

  return data!
}

export const useMaxSpendable = (wallet: EdgeCurrencyWallet, spendInfo: EdgeSpendInfo, config?: QueryConfig<string>) => {
  return useQuery({
    queryKey: [wallet.id, 'maxSpendable', spendInfo],
    queryFn: () => wallet.getMaxSpendable(spendInfo),
    config: { suspense: false, ...config },
  })
}

export const useMaxTransaction = (
  wallet: EdgeCurrencyWallet,
  spendInfo: EdgeSpendInfo,
  config?: QueryConfig<EdgeTransaction>,
) => {
  return useQuery({
    queryKey: [wallet.id, 'maxSpendableTransaction', spendInfo],
    queryFn: async () => {
      const maxSpendable = await wallet.getMaxSpendable(spendInfo)
      const spendTargets = [{ ...spendInfo.spendTargets[0], nativeAmount: maxSpendable }]
      const maxSpendInfo = { ...spendInfo, spendTargets }

      return wallet.makeSpend(maxSpendInfo)
    },
    config: { ...config },
  })
}

export const useNewTransaction = (
  wallet: EdgeCurrencyWallet,
  spendInfo: EdgeSpendInfo,
  config?: QueryConfig<EdgeTransaction>,
) => {
  return useQuery({
    queryKey: [wallet.id, 'transaction', spendInfo],
    queryFn: () => wallet.makeSpend(spendInfo),
    config: { suspense: false, ...config },
  })
}
