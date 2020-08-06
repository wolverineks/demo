import {
  EdgeAccount,
  EdgeContext,
  EdgeCurrencyCodeOptions,
  EdgeCurrencyInfo,
  EdgeCurrencyWallet,
  EdgeDenomination,
  EdgeGetTransactionsOptions,
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
  getExchangeDenomination,
  getInfo,
  getTokenInfo,
  isUnique,
  nativeToDenominated,
} from '../utils'
import { optimisticMutationOptions } from './optimisticMutationOptions'
import { useWatch } from './watch'

// EDGE CONTEXT
export const useLocalUsers = (context: EdgeContext) => useWatch(context, 'localUsers')
export const usePaused = (context: EdgeContext) => useWatch(context, 'paused')

// ACCOUNTS WITH PIN LOGIN
export const useAccountsWithPinLogin = (context: EdgeContext) =>
  useLocalUsers(context).filter(({ pinLoginEnabled }) => pinLoginEnabled)

// LOGIN MESSAGES
export const useLoginMessages = (
  context: EdgeContext,
  username: string,
  config?: QueryConfig<{ otpResetPending: boolean; recovery2Corrupt: boolean }, unknown>,
) =>
  useQuery({
    queryKey: ['loginMessages'],
    queryFn: () => context.fetchLoginMessages().then((loginMessages) => loginMessages[username] || []),
    config: { suspense: true, cacheTime: 0, staleTime: Infinity, ...config },
  }).data!

// CREATE ACCOUNT
export const useCreateAccount = (context: EdgeContext) =>
  useMutation(({ username, password, pin, otp }: { username: string; password: string; pin: string; otp: string }) =>
    context.createAccount(username, password, pin, { otp }),
  )

// LOGIN WITH PIN
export const useLoginWithPin = (
  context: EdgeContext,
  config?: MutationConfig<EdgeAccount, unknown, { username: string; pin: string }>,
) => useMutation(({ username, pin }: { username: string; pin: string }) => context.loginWithPIN(username, pin), config)

// LOGIN WITH PASSWORD
export const useLoginWithPassword = (
  context: EdgeContext,
  config?: MutationConfig<EdgeAccount, unknown, { username: string; password: string }>,
) =>
  useMutation(
    ({ username, password }: { username: string; password: string }) => context.loginWithPassword(username, password),
    config,
  )

// EDGE ACCOUNT
export const useActiveWalletIds = (account: EdgeAccount) => useWatch(account, 'activeWalletIds')
export const useAllKeys = (account: EdgeAccount) => useWatch(account, 'allKeys')
export const useArchivedWalletIds = (account: EdgeAccount) => useWatch(account, 'archivedWalletIds')
export const useCurrencyWallets = (account: EdgeAccount) => useWatch(account, 'currencyWallets')
export const useHiddenWalletIds = (account: EdgeAccount) => useWatch(account, 'hiddenWalletIds')
export const useOtpResetDate = (account: EdgeAccount) => useWatch(account, 'otpResetDate')
export const useLoggedIn = (account: EdgeAccount) => useWatch(account, 'loggedIn')

export const useActiveWalletIds_optimisticUpdates = (account: EdgeAccount) => {
  const { data, refetch } = useQuery({
    queryKey: [account.username, 'activeWalletIds'],
    queryFn: () => Promise.resolve(account.activeWalletIds),
    config: { initialData: account.activeWalletIds, initialStale: true },
  })

  useWatch(account, 'activeWalletIds', refetch)

  return data!
}

export const useArchivedWalletIds_optimisticUpdates = (account: EdgeAccount) => {
  const { data, refetch } = useQuery({
    queryKey: [account.username, 'archivedWalletIds'],
    queryFn: () => Promise.resolve(account.archivedWalletIds),
    config: { initialData: account.archivedWalletIds, initialStale: true },
  })

  useWatch(account, 'archivedWalletIds', refetch)

  return data!
}

export const useDeletedWalletIds_optimisticUpdates = (account: EdgeAccount) => {
  const deletedWalletIds = account.allKeys.filter(({ deleted }) => deleted).map(({ id }) => id)

  const { data, refetch } = useQuery({
    queryKey: [account.username, 'deletedWalletIds'],
    queryFn: () => Promise.resolve(deletedWalletIds),
    config: { initialData: deletedWalletIds, initialStale: true },
  })

  useWatch(account, 'archivedWalletIds', refetch)

  return data!
}

export const useOtpKey = (account: EdgeAccount) => {
  const { data, refetch } = useQuery({
    queryKey: [account.username, 'otpKey'],
    queryFn: () => Promise.resolve(account.otpKey),
    config: { initialData: account.otpKey },
  })

  useWatch(account, 'otpKey', refetch)

  return data!
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
  otpKey: useOtpKey(account),
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

// ACTIVE CURRENCY INFOS
export const useActiveCurrencyInfos = (account: EdgeAccount) =>
  useSortedCurrencyWallets(account)
    .map(({ currencyInfo }) => currencyInfo)
    .filter(isUnique)

// ACTIVE TOKEN INFOS
export const useActiveTokenInfos = (account: EdgeAccount) =>
  useSortedCurrencyWallets(account)
    .map((wallet) => queryCache.getQueryData([wallet.id, 'enabledTokens']) as string[])
    .reduce((result, current = []) => [...result, ...current], [])
    .filter(isUnique)
    .map((currencyCode) => getTokenInfo(account, currencyCode))

// CHANGE WALLET STATES
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

// LOGIN METHOD
const unknownLogin = () => {
  throw new Error('unknown login')
}

export const useLoginMethod = (account: EdgeAccount) =>
  account.pinLogin
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

export const useWallet = (account: EdgeAccount, walletId: string, config?: QueryConfig<EdgeCurrencyWallet>) =>
  useQuery({
    queryKey: [walletId, 'wallet'],
    queryFn: () => account.waitForCurrencyWallet(walletId),
    config: { suspense: true, ...config },
  }).data!

// ACTIVE WALLET INFOS
export const useActiveWalletInfos = (account: EdgeAccount) =>
  useActiveWalletIds(account).map((id) => account.allKeys.find((walletInfo) => walletInfo.id === id)!)

// ARCHIVED WALLET INFOS
export const useArchivedWalletInfos = (account: EdgeAccount) =>
  useArchivedWalletIds(account).map((id) => account.allKeys.find((walletInfo) => walletInfo.id === id))

// DELETED WALLET INFOS
export const useDeletedWalletInfos = (account: EdgeAccount) =>
  useDeletedWalletIds(account).map((id) => account.allKeys.find((walletInfo) => walletInfo.id === id))

export const useDeletedWalletIds = (account: EdgeAccount) =>
  useAllKeys(account)
    .filter(({ deleted }) => deleted)
    .map(({ id }) => id)

// PIN LOGIN
export const useReadPinLoginEnabled = (context: EdgeContext, account: EdgeAccount, config?: QueryConfig<boolean>) =>
  useQuery({
    queryKey: [account.username, 'pinLoginEnabled'],
    queryFn: () => context.pinLoginEnabled(account.username),
    config: { suspense: true, ...config },
  })

export const useWritePinLoginEnabled = (account: EdgeAccount) =>
  useMutation(
    (enableLogin: boolean) => account.changePin({ enableLogin }),
    optimisticMutationOptions([account.username, 'pinLoginEnabled'], (enableLogin) => enableLogin),
  )

export const usePinLoginEnabled = (context: EdgeContext, account: EdgeAccount) =>
  [useReadPinLoginEnabled(context, account).data!, useWritePinLoginEnabled(account)[0]] as const

// SORTED CURRENCY WALLETS
export const useSortedCurrencyWallets = (account: EdgeAccount) => {
  const activeWalletIds = useActiveWalletIds(account)
  const currencyWallets = useCurrencyWallets(account)

  return activeWalletIds.map((id) => currencyWallets[id]).filter(Boolean)
}

// EDGE CURRENCY WALLET
export const useBalance = (wallet: EdgeCurrencyWallet, currencyCode: string) => {
  const { refetch, data } = useQuery({
    queryKey: [wallet.id, 'balance', currencyCode],
    queryFn: () => waitForBalance(wallet, currencyCode),
    config: { suspense: true, cacheTime: 0, staleTime: Infinity },
  })

  useWatch(wallet, 'balances', () => refetch())

  return data!
}

export const waitForBalance = (wallet: EdgeCurrencyWallet, code: string): Promise<string> =>
  wallet.balances[code] != null
    ? Promise.resolve(wallet.balances[code])
    : new Promise((resolve) => {
        const unsubscribe = wallet.watch('balances', (balances) => {
          if (balances[code] != null) {
            unsubscribe()
            resolve(balances[code])
          }
        })
      })

export const useBalances = (wallet: EdgeCurrencyWallet) => useWatch(wallet, 'balances')
export const useBlockHeight = (wallet: EdgeCurrencyWallet) => useWatch(wallet, 'blockHeight')
export const useName = (wallet: EdgeCurrencyWallet) => useWatch(wallet, 'name')
export const useSyncRatio = (wallet: EdgeCurrencyWallet) => useWatch(wallet, 'syncRatio')

// ENABLED TOKEN INFOS
export const useEnabledTokenInfos = (wallet: EdgeCurrencyWallet) => {
  const enabledTokens = useEnabledTokens(wallet)

  return wallet.currencyInfo.metaTokens.filter((tokenInfo) => enabledTokens.includes(tokenInfo.currencyCode))
}

export const useCurrencyCodes = (wallet: EdgeCurrencyWallet) =>
  [wallet.currencyInfo.currencyCode, ...useEnabledTokens(wallet)].filter(isUnique)

// FIAT CURRENCY CODE
export const useReadFiatCurrencyCode = (wallet: EdgeCurrencyWallet) => useWatch(wallet, 'fiatCurrencyCode')
export const useWriteFiatCurrencyCode = (wallet: EdgeCurrencyWallet) => useMutation(wallet.setFiatCurrencyCode)
export const useFiatCurrencyCode = (wallet: EdgeCurrencyWallet) =>
  [useReadFiatCurrencyCode(wallet), useWriteFiatCurrencyCode(wallet)[0]] as const

// RECEIVE ADDRESS AND ENCODE URI
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
}) =>
  useQuery({
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
    config: { staleTime: Infinity, cacheTime: 0, suspense: false, ...config },
  })

// ENABLED TOKENS
export const useEnabledTokens = (wallet: EdgeCurrencyWallet, config?: QueryConfig<string[]>) =>
  useQuery({
    queryKey: [wallet.id, 'enabledTokens'],
    queryFn: () =>
      wallet
        .getEnabledTokens()
        // WTF? Why is the parent currencyCode in enabledTokens?
        .then((tokens) => tokens.filter((tokenCode) => tokenCode !== wallet.currencyInfo.currencyCode)),
    config: { suspense: true, ...config },
  }).data!

export const useEnableToken = (wallet: EdgeCurrencyWallet) =>
  useMutation(
    (tokenCurrencyCode: string) => wallet.enableTokens([tokenCurrencyCode]),
    optimisticMutationOptions([wallet.id, 'enabledTokens'], (tokenCurrencyCode: string, current: string[] = []) => [
      ...current,
      tokenCurrencyCode,
    ]),
  )[0]

export const useDisableToken = (wallet: EdgeCurrencyWallet) =>
  useMutation(
    (tokenCurrencyCode: string) => wallet.disableTokens([tokenCurrencyCode]),
    optimisticMutationOptions([wallet.id, 'enabledTokens'], (tokenCurrencyCode: string, current: string[] = []) =>
      current.filter((currencyCode) => currencyCode !== tokenCurrencyCode),
    ),
  )[0]

export const useTokens = (wallet: EdgeCurrencyWallet) => ({
  availableTokens: wallet.currencyInfo.metaTokens.map(({ currencyCode }) => currencyCode),
  enabledTokens: useEnabledTokens(wallet),
  enableToken: useEnableToken(wallet),
  disableToken: useDisableToken(wallet),
})

// TRANSACTIONS
export const useTransactions = (wallet: EdgeCurrencyWallet, config?: QueryConfig<EdgeTransaction[]>) => {
  const { data, refetch } = useQuery({
    queryKey: [wallet.id, 'transactions'],
    queryFn: () => wallet.getTransactions(),
    config: { suspense: true, staleTime: Infinity, cacheTime: 0, ...config },
  })

  useOnNewTransactions(
    wallet,
    React.useCallback(() => refetch(), [refetch]),
  )

  return data!
}

// TRANSACTION COUNT
export const useTransactionCount = (
  wallet: EdgeCurrencyWallet,
  options?: EdgeGetTransactionsOptions,
  config?: QueryConfig<number>,
) => {
  const { data, refetch } = useQuery({
    queryKey: [wallet.id, 'transactionCount', options],
    queryFn: () => wallet.getNumTransactions(options),
    config: { suspense: false, staleTime: Infinity, cacheTime: 0, ...config },
  })

  useOnNewTransactions(
    wallet,
    React.useCallback(() => refetch(), [refetch]),
  )

  return data!
}

// MAX SPENDABLE
export const useMaxSpendable = (wallet: EdgeCurrencyWallet, spendInfo: EdgeSpendInfo, config?: QueryConfig<string>) =>
  useQuery({
    queryKey: [wallet.id, 'maxSpendable', spendInfo],
    queryFn: () => wallet.getMaxSpendable(spendInfo),
    config: { suspense: false, staleTime: Infinity, cacheTime: 0, retry: 0, ...config },
  })

// MAX TRANSACTION
export const useMaxTransaction = (
  wallet: EdgeCurrencyWallet,
  spendInfo: EdgeSpendInfo,
  config?: QueryConfig<EdgeTransaction>,
) =>
  useQuery({
    queryKey: [wallet.id, 'maxSpendableTransaction', spendInfo],
    queryFn: async () => {
      const maxSpendable = await wallet.getMaxSpendable(spendInfo)
      const spendTargets = [{ ...spendInfo.spendTargets[0], nativeAmount: maxSpendable }]
      const maxSpendInfo = { ...spendInfo, spendTargets }

      return wallet.makeSpend(maxSpendInfo)
    },
    config: { ...config },
  })

// NEW TRANSACTIONS
export const useNewTransaction = (
  wallet: EdgeCurrencyWallet,
  spendInfo: EdgeSpendInfo,
  config?: QueryConfig<EdgeTransaction>,
) =>
  useQuery({
    queryKey: [wallet.id, 'transaction', spendInfo],
    queryFn: () => wallet.makeSpend(spendInfo),
    config: {
      suspense: false,
      staleTime: Infinity,
      cacheTime: 0,
      retry: 0,
      ...config,
    },
  })

// CONVERSIONS

export const useExchangeToNative = ({
  account,
  currencyCode,
  exchangeAmount,
}: {
  account: EdgeAccount
  currencyCode: string
  exchangeAmount: string
}) =>
  denominatedToNative({
    denomination: getExchangeDenomination(account, currencyCode),
    amount: exchangeAmount,
  })

export const useDisplayToNative = (
  {
    account,
    currencyCode,
    displayAmount,
  }: {
    account: EdgeAccount
    currencyCode: string
    displayAmount: string
  },
  config?: { onSuccess: (amount: string) => any },
) => {
  const result = denominatedToNative({
    denomination: useDisplayDenomination(account, currencyCode)[0],
    amount: displayAmount,
  })
  config?.onSuccess(result)

  return result
}

export const useNativeToExchange = ({
  account,
  currencyCode,
  nativeAmount,
}: {
  account: EdgeAccount
  currencyCode: string
  nativeAmount: string
}) =>
  nativeToDenominated({
    denomination: getExchangeDenomination(account, currencyCode),
    nativeAmount,
  })

export const useNativeToDisplay = ({
  account,
  currencyCode,
  nativeAmount,
}: {
  account: EdgeAccount
  currencyCode: string
  nativeAmount: string
}) =>
  nativeToDenominated({
    denomination: useDisplayDenomination(account, currencyCode)[0],
    nativeAmount,
  })

// COMPOUND
export const useExchangeToDisplay = ({
  account,
  currencyCode,
  exchangeAmount,
}: {
  account: EdgeAccount
  currencyCode: string
  exchangeAmount: string
}) =>
  useNativeToDisplay({
    account,
    currencyCode,
    nativeAmount: useExchangeToNative({ account, currencyCode, exchangeAmount }),
  })

export const useDisplayToExchange = ({
  account,
  currencyCode,
  displayAmount,
}: {
  account: EdgeAccount
  currencyCode: string
  displayAmount: string
}) =>
  nativeToDenominated({
    denomination: getExchangeDenomination(account, currencyCode),
    nativeAmount: useDisplayToNative({ account, displayAmount, currencyCode }),
  })

// SETTINGS

// AUTOLOGOUT
const defaultAutoLogout = { enabled: true, delay: 3600 }

type AutoLogoutSetting = {
  enabled: boolean
  delay: number
}

export const useReadAutoLogout = (account: EdgeAccount, config?: QueryConfig<AutoLogoutSetting>) =>
  useQuery({
    queryKey: [account.username, 'autoLogout'],
    queryFn: () =>
      account.dataStore
        .getItem('autoLogout', 'autoLogout.json')
        .then(JSON.parse)
        .catch(() => defaultAutoLogout) as Promise<AutoLogoutSetting>,
    config: { suspense: true, cacheTime: 0, staleTime: Infinity, ...config },
  })

export const useWriteAutoLogout = (account: EdgeAccount) =>
  useMutation(
    (autoLogout: AutoLogoutSetting) =>
      account.dataStore.setItem('autoLogout', 'autoLogout.json', JSON.stringify(autoLogout)),
    optimisticMutationOptions([account.username, 'autoLogout']),
  )

export const useAutoLogout = (account: EdgeAccount) =>
  [useReadAutoLogout(account).data!, useWriteAutoLogout(account)[0]] as const

// DEFAULT FIAT CURRENCY CODE
const defaultFiatCurrencyCode = 'iso:USD'

const useReadDefaultFiatCurrencyCode = (account: EdgeAccount, config?: QueryConfig<string>) =>
  useQuery({
    queryKey: [account.username, 'defaultFiatCurrencyCode'],
    queryFn: () =>
      account.dataStore
        .getItem('defaultFiatCurrencyCode', 'defaultFiatCurrencyCode.json')
        .then(JSON.parse)
        .catch(() => defaultFiatCurrencyCode) as Promise<string>,
    config: { suspense: true, ...config },
  })

export const useWriteDefaultFiatCurrencyCode = (account: EdgeAccount) =>
  useMutation(
    (currencyCode: string) =>
      account.dataStore.setItem(
        'defaultFiatCurrencyCode',
        'defaultFiatCurrencyCode.json',
        JSON.stringify(currencyCode),
      ),
    optimisticMutationOptions([account.username, 'defaultFiatCurrencyCode']),
  )

export const useDefaultFiatCurrencyCode = (account: EdgeAccount) =>
  [useReadDefaultFiatCurrencyCode(account).data!, useWriteDefaultFiatCurrencyCode(account)[0]] as const

// DEFAULT FIAT INFO
export const useDefaultFiatInfo = (account: EdgeAccount) => {
  const currencyCode = useDefaultFiatCurrencyCode(account)[0]

  return getFiatInfo(currencyCode)
}

// DISPLAY DENOMINATION MULTIPLIER
export const useReadDisplayDenominationMultiplier = (
  account: EdgeAccount,
  currencyInfo: EdgeCurrencyInfo | EdgeMetaToken,
  config?: QueryConfig<string | EdgeDenomination>,
) =>
  useQuery({
    queryKey: [currencyInfo.currencyCode, 'displayDenominationMultiplier'],
    queryFn: () =>
      account.dataStore
        .getItem('displayDenominationMultiplier', currencyInfo.currencyCode)
        .catch(() => currencyInfo.denominations[0]),
    config: { suspense: true, ...config },
  })

export const useWriteDisplayDenominationMultiplier = (
  account: EdgeAccount,
  currencyInfo: EdgeCurrencyInfo | EdgeMetaToken,
) =>
  useMutation(
    (displayDenominationMultiplier: string) =>
      account.dataStore.setItem(
        'displayDenominationMultiplier',
        currencyInfo.currencyCode,
        displayDenominationMultiplier,
      ),
    optimisticMutationOptions([currencyInfo.currencyCode, 'displayDenominationMultiplier']),
  )

export const useDisplayDenominationMultiplier = (
  account: EdgeAccount,
  currencyInfo: EdgeCurrencyInfo | EdgeMetaToken,
) =>
  [
    useReadDisplayDenominationMultiplier(account, currencyInfo).data,
    useWriteDisplayDenominationMultiplier(account, currencyInfo)[0],
  ] as const

// DISPLAY DENOMINATION
export const useDisplayDenomination = (account: EdgeAccount, currencyCode: string) => {
  const currencyInfo = getInfo(account, currencyCode)
  const [multiplier, write] = useDisplayDenominationMultiplier(account, currencyInfo)

  return [
    currencyInfo.denominations.find((denomination) => denomination.multiplier === multiplier) ||
      currencyInfo.denominations[0],
    React.useCallback((denomination: EdgeDenomination) => write(denomination.multiplier), [write]),
  ] as const
}

// DISPLAY AMOUNT
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

// CONVERT CURRENCY
export const useExchangeRate = (
  {
    account,
    fromCurrencyCode,
    toCurrencyCode,
  }: {
    account: EdgeAccount
    fromCurrencyCode: string
    toCurrencyCode: string
  },
  config?: QueryConfig<number, unknown>,
) =>
  useQuery({
    queryKey: ['exchangeRate', { fromCurrencyCode, toCurrencyCode }],
    queryFn: () => account.rateCache.convertCurrency(fromCurrencyCode, toCurrencyCode),
    config: { suspense: true, cacheTime: 0, staleTime: 0, ...config },
  }).data!

export const useConvertedAmount = (
  {
    account,
    exchangeAmount,
    fromCurrencyCode,
    toCurrencyCode,
  }: {
    account: EdgeAccount
    exchangeAmount: number
    fromCurrencyCode: string
    toCurrencyCode: string
  },
  config?: QueryConfig<number>,
) => {
  return useQuery({
    queryKey: [{ fromCurrencyCode, toCurrencyCode, amount: exchangeAmount }],
    queryFn: () => account.rateCache.convertCurrency(fromCurrencyCode, toCurrencyCode, exchangeAmount),
    config: { suspense: true, refetchInterval: 10000, ...config },
  }).data!
}

// FIAT AMOUNT
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

  return useQuery({
    queryKey: [{ fromCurrencyCode, fiatCurrencyCode, exchangeAmount }],
    queryFn: () => account.rateCache.convertCurrency(fromCurrencyCode, fiatCurrencyCode, exchangeAmount),
    config: { suspense: true, refetchInterval: 10000, ...config },
  }).data!
}

// NATIVE AMOUNT
export const useNativeAmount = (
  {
    account,
    fiatAmount,
    fiatCurrencyCode,
    toCurrencyCode,
  }: {
    account: EdgeAccount
    fiatAmount: number
    fiatCurrencyCode: string
    toCurrencyCode: string
  },
  config?: QueryConfig<number>,
) => {
  const denomination = getExchangeDenomination(account, toCurrencyCode)
  const exchangeAmount = useQuery({
    queryKey: [{ fiatCurrencyCode, toCurrencyCode, fiatAmount }],
    queryFn: () => account.rateCache.convertCurrency(fiatCurrencyCode, toCurrencyCode, fiatAmount),
    config: { suspense: true, ...config },
  }).data!

  const nativeAmount = denominatedToNative({ denomination, amount: String(exchangeAmount) })

  return nativeAmount
}

// INACTIVE WALLETS
export const useReadInactiveWallet = (account: EdgeAccount, walletId: string, config?: QueryConfig<InactiveWallet>) =>
  useQuery({
    queryKey: [walletId, 'inactiveWallet'],
    queryFn: () => account.dataStore.getItem('inactiveWallets', walletId).then(JSON.parse) as Promise<InactiveWallet>,
    config: { suspense: true, cacheTime: 0, ...config },
  }).data!

export const useWriteInactiveWallet = (account: EdgeAccount, wallet: EdgeCurrencyWallet) => {
  const [update] = useMutation(
    () => account.dataStore.setItem('inactiveWallets', wallet.id, JSON.stringify(wallet)),
    // optimisticMutationOptions<void>([walletId, 'inactiveWallet']), // FIXME
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
