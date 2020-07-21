import {
  EdgeAccount,
  EdgeContext,
  EdgeCurrencyCodeOptions,
  EdgeCurrencyInfo,
  EdgeCurrencyWallet,
  EdgeDenomination,
  EdgeGetTransactionsOptions,
  EdgeMetaToken,
  EdgeSpendInfo,
  EdgeWalletState,
} from 'edge-core-js'
import React from 'react'
import { queryCache, useMutation, useQuery } from 'react-query'

import { getFiatInfo } from '../Fiat/getFiatInfo'
import {
  denominationToNative,
  getExchangeDenomination,
  getExchangeDenominationFromCC,
  getTokenInfoFromCurrencyCode,
  isUnique,
  nativeToDenomination,
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
export const useLoginMessages = (context: EdgeContext, username: string) =>
  useQuery({
    queryKey: [username, 'loginMessages'],
    queryFn: () => context.fetchLoginMessages().then((loginMessages) => loginMessages[username] || []),
    config: { suspense: true, cacheTime: 0, staleTime: Infinity },
  }).data!

// LOGIN WITH PIN
export const useLoginWithPin = (context: EdgeContext) =>
  useMutation(({ username, pin }: { username: string; pin: string }) => context.loginWithPIN(username, pin))

// LOGIN WITH PASSWORD
export const useLoginWithPassword = (context: EdgeContext) =>
  useMutation(({ username, password }: { username: string; password: string }) =>
    context.loginWithPassword(username, password),
  )

// EDGE ACCOUNT
export const useActiveWalletIds = (account: EdgeAccount) => useWatch(account, 'activeWalletIds')
export const useAllKeys = (account: EdgeAccount) => useWatch(account, 'allKeys')
export const useArchivedWalletIds = (account: EdgeAccount) => useWatch(account, 'archivedWalletIds')
export const useCurrencyWallets = (account: EdgeAccount) => useWatch(account, 'currencyWallets')
export const useHiddenWalletIds = (account: EdgeAccount) => useWatch(account, 'hiddenWalletIds')
export const useOtpKey = (account: EdgeAccount) => useWatch(account, 'otpKey')
export const useOtpResetDate = (account: EdgeAccount) => useWatch(account, 'otpResetDate')
export const useLoggedIn = (account: EdgeAccount) => useWatch(account, 'loggedIn')

// ACTIVE TOKEN INFOS
export const useActiveTokenInfos = (account: EdgeAccount) =>
  useSortedCurrencyWallets(account)
    .map((walletId) => queryCache.getQueryData([walletId, 'enabledTokens']) as string[])
    .reduce((result, current = []) => [...result, ...current], [])
    .filter(isUnique)
    .filter((currencyCode) => !['EOS', 'ETH', 'FIO'].includes(currencyCode)) // WTF?
    .map((currencyCode) => getTokenInfoFromCurrencyCode(account, currencyCode))

// ACTIVE CURRENCY INFOS
export const useActiveCurrencyInfos = (account: EdgeAccount) =>
  useSortedCurrencyWallets(account)
    .map(({ currencyInfo }) => currencyInfo)
    .filter(isUnique)

// CHANGE WALLET STATES
export const useChangeWalletStates = (account: EdgeAccount, walletId: string) => {
  const [
    changeWalletStates,
    rest,
  ] = useMutation(({ walletId, walletState }: { walletId: string; walletState: EdgeWalletState }) =>
    account.changeWalletStates({ [walletId]: walletState }),
  )

  return {
    activateWallet: React.useCallback(
      () => changeWalletStates({ walletId, walletState: { archived: false, deleted: false } }),
      [changeWalletStates, walletId],
    ),
    archiveWallet: React.useCallback(
      () => changeWalletStates({ walletId, walletState: { archived: true, deleted: false } }),
      [changeWalletStates, walletId],
    ),
    deleteWallet: React.useCallback(
      () => changeWalletStates({ walletId, walletState: { archived: false, deleted: true } }),
      [changeWalletStates, walletId],
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

export const useWallet = (account: EdgeAccount, walletId: string) => {
  const wallet = useQuery({
    queryKey: [walletId, 'wallet'],
    queryFn: () => account.waitForCurrencyWallet(walletId),
    config: { suspense: true, useErrorBoundary: false },
  }).data!

  return wallet
}

export const useDeletedWalletIds = (account: EdgeAccount) =>
  useAllKeys(account)
    .filter(({ deleted }) => deleted)
    .map(({ id }) => id)

// PIN LOGIN
export const useReadPinLoginEnabled = (context: EdgeContext, account: EdgeAccount) =>
  useQuery({
    queryKey: [account.username, 'pinLoginEnabled'],
    queryFn: () => context.pinLoginEnabled(account.username),
    config: { suspense: true },
  })

export const useWritePinLoginEnabled = (account: EdgeAccount) =>
  useMutation(
    (enabled: boolean) => account.changePin({ enableLogin: enabled }),
    optimisticMutationOptions([account.username, 'pinLoginEnabled'], (enabled) => enabled),
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
export const useBalance = (wallet: EdgeCurrencyWallet, currencyCode: string) =>
  useWatch(wallet, 'balances')[currencyCode]
export const useBalances = (wallet: EdgeCurrencyWallet) => useWatch(wallet, 'balances')
export const useBlockHeight = (wallet: EdgeCurrencyWallet) => useWatch(wallet, 'blockHeight')
export const useFiatCurrencyCode = (wallet: EdgeCurrencyWallet) => useWatch(wallet, 'fiatCurrencyCode')
export const useName = (wallet: EdgeCurrencyWallet) => useWatch(wallet, 'name')
export const useSyncRatio = (wallet: EdgeCurrencyWallet) => useWatch(wallet, 'syncRatio')

export const useSetFiatCurrencyCode = (wallet: EdgeCurrencyWallet) =>
  useMutation((fiatCurrencyCode: string) => wallet.setFiatCurrencyCode(fiatCurrencyCode))[0]

// ENABLED TOKEN INFOS
export const useEnabledTokenInfos = (wallet: EdgeCurrencyWallet) => {
  const enabledTokens = useEnabledTokens(wallet)

  return wallet.currencyInfo.metaTokens.filter((tokenInfo) => enabledTokens.includes(tokenInfo.currencyCode))
}

// RECEIVE ADDRESS AND ENCODE URI
export const useReceiveAddressAndEncodeUri = (
  wallet: EdgeCurrencyWallet,
  nativeAmount: string,
  options?: EdgeCurrencyCodeOptions,
) =>
  useQuery({
    queryKey: [wallet.id, 'receiveAddressAndEncodeUri', nativeAmount, options],
    queryFn: () => {
      const receiveAddress = wallet.getReceiveAddress({ currencyCode: options?.currencyCode })
      const encodeUri = receiveAddress.then(({ publicAddress }) =>
        wallet.encodeUri({
          publicAddress,
          nativeAmount: nativeAmount || '0',
        }),
      )

      return Promise.all([receiveAddress, encodeUri]).then(([receiveAddress, uri]) => ({ receiveAddress, uri }))
    },
    config: { staleTime: Infinity, cacheTime: 0, suspense: false },
  })

// ENABLED TOKENS
export const useEnabledTokens = (wallet: EdgeCurrencyWallet) => {
  return useQuery({
    queryKey: [wallet.id, 'enabledTokens'],
    queryFn: () => wallet.getEnabledTokens(),
    config: { suspense: true },
  }).data!
}

export const useEnableTokens = (wallet: EdgeCurrencyWallet) =>
  useMutation(
    (tokenCurrencyCode: string) => wallet.enableTokens([tokenCurrencyCode]),
    optimisticMutationOptions([wallet.id, 'enabledTokens'], (tokenCurrencyCode, current: string[] = []) => {
      const next = [...current, tokenCurrencyCode]

      console.log('qwe', { next })

      return next
    }),
  )[0]

export const useDisableTokens = (wallet: EdgeCurrencyWallet) =>
  useMutation(
    (tokenCurrencyCode: string) => wallet.disableTokens([tokenCurrencyCode]),
    optimisticMutationOptions([wallet.id, 'enabledTokens'], (tokenCurrencyCode, current: string[] = []) =>
      current.filter((currencyCode) => currencyCode !== tokenCurrencyCode),
    ),
  )[0]

// TRANSACTIONS
export const useTransactions = (wallet: EdgeCurrencyWallet, options: EdgeGetTransactionsOptions) =>
  useQuery({
    queryKey: [wallet.id, 'transactions', options],
    queryFn: () => wallet.getTransactions(options),
    config: { suspense: false, staleTime: Infinity, cacheTime: 0 },
  })

// TRANSACTION COUNT
export const useTransactionCount = (wallet: EdgeCurrencyWallet, options: EdgeGetTransactionsOptions) =>
  useQuery({
    queryKey: [wallet.id, 'transactionCount', options],
    queryFn: () => wallet.getNumTransactions(options),
    config: { suspense: false, staleTime: Infinity, cacheTime: 0 },
  })

// MAX SPENDABLE
export const useMaxSpendable = (wallet: EdgeCurrencyWallet, spendInfo: EdgeSpendInfo) =>
  useQuery({
    queryKey: [wallet.id, 'maxSpendable', spendInfo],
    queryFn: () => wallet.getMaxSpendable(spendInfo),
    config: { suspense: false, staleTime: Infinity, cacheTime: 0, useErrorBoundary: false, retry: 0 },
  })

// MAX TRANSACTION
export const useMaxTransaction = (wallet: EdgeCurrencyWallet, spendInfo: EdgeSpendInfo) =>
  useQuery({
    queryKey: [wallet.id, 'maxSpendableTransaction', spendInfo],
    queryFn: async () => {
      const maxSpendable = await wallet.getMaxSpendable(spendInfo)
      const spendTargets = [{ ...spendInfo.spendTargets[0], nativeAmount: maxSpendable }]
      const maxSpendInfo = { ...spendInfo, spendTargets }

      return wallet.makeSpend(maxSpendInfo)
    },
  })

// NEW TRANSACTIONS
export const useNewTransaction = (wallet: EdgeCurrencyWallet, spendInfo: EdgeSpendInfo) =>
  useQuery({
    queryKey: [wallet.id, 'transaction', spendInfo],
    queryFn: () => wallet.makeSpend(spendInfo),
    config: { suspense: false, staleTime: Infinity, cacheTime: 0, useErrorBoundary: false, retry: 0 },
  })

// SETTINGS

// AUTOLOGOUT
const defaultAutoLogout = { enabled: true, delay: 3600 }

type AutoLogoutSetting = {
  enabled: boolean
  delay: number
}

export const useReadAutoLogout = (account: EdgeAccount) =>
  useQuery({
    queryKey: 'autoLogout',
    queryFn: () =>
      account.dataStore
        .getItem('autoLogout', 'autoLogout.json')
        .then(JSON.parse)
        .catch(() => defaultAutoLogout) as Promise<AutoLogoutSetting>,
    config: { suspense: true, cacheTime: 0, staleTime: Infinity },
  })

export const useWriteAutoLogout = (account: EdgeAccount) =>
  useMutation(
    (autoLogout: AutoLogoutSetting) =>
      account.dataStore.setItem('autoLogout', 'autoLogout.json', JSON.stringify(autoLogout)),
    optimisticMutationOptions('autoLogout'),
  )

export const useAutoLogout = (account: EdgeAccount) =>
  [useReadAutoLogout(account).data!, useWriteAutoLogout(account)[0]] as const

// DEFAULT FIAT CURRENCY CODE
const defaultFiatCurrencyCode = 'iso:USD'

const useReadDefaultFiatCurrencyCode = (account: EdgeAccount) =>
  useQuery({
    queryKey: 'defaultFiatCurrencyCode',
    queryFn: () =>
      account.dataStore
        .getItem('defaultFiatCurrencyCode', 'defaultFiatCurrencyCode.json')
        .then(JSON.parse)
        .catch(() => defaultFiatCurrencyCode) as Promise<string>,
    config: { suspense: true },
  })

export const useWriteDefaultFiatCurrencyCode = (account: EdgeAccount) =>
  useMutation(
    (currencyCode: string) =>
      account.dataStore.setItem(
        'defaultFiatCurrencyCode',
        'defaultFiatCurrencyCode.json',
        JSON.stringify(currencyCode),
      ),
    optimisticMutationOptions('defaultFiatCurrencyCode'),
  )

export const useDefaultFiatCurrencyCode = (account: EdgeAccount) =>
  [useReadDefaultFiatCurrencyCode(account).data!, useWriteDefaultFiatCurrencyCode(account)[0]] as const

// DEFAULT FIAT INFO
export const useDefaultFiatInfo = (account: EdgeAccount) => {
  const currencyCode = useDefaultFiatCurrencyCode(account)[0]

  return getFiatInfo({ currencyCode })
}

// DISPLAY DENOMINATION MULTIPLIER
export const useReadDisplayDenominationMultiplier = (
  account: EdgeAccount,
  currencyInfo: EdgeCurrencyInfo | EdgeMetaToken,
) =>
  useQuery({
    queryKey: [currencyInfo.currencyCode, 'displayDenominationMultiplier'],
    queryFn: () =>
      account.dataStore
        .getItem('displayDenominationMultiplier', currencyInfo.currencyCode)
        .catch(() => currencyInfo.denominations[0]),
    config: { suspense: true },
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
export const useDisplayDenomination = (account: EdgeAccount, currencyInfo: EdgeCurrencyInfo | EdgeMetaToken) => {
  const [multiplier, write] = useDisplayDenominationMultiplier(account, currencyInfo)

  return [
    currencyInfo.denominations.find((denomination) => denomination.multiplier === multiplier) ||
      currencyInfo.denominations[0],
    React.useCallback((denomination: EdgeDenomination) => write(denomination.multiplier), [write]),
  ] as const
}

// FIAT AMOUNT
export const useFiatAmount = (
  account: EdgeAccount,
  currencyInfo: EdgeCurrencyInfo | EdgeMetaToken,
  toCurrencyCode: string,
  nativeAmount: string,
) => {
  const denomination = getExchangeDenomination({ currencyInfo })
  const exchangeAmount = nativeToDenomination({ denomination, nativeAmount })
  const fromCurrencyCode = currencyInfo.currencyCode
  const amount = Number(exchangeAmount)

  return useQuery({
    queryKey: [{ fromCurrencyCode, toCurrencyCode, exchangeAmount }],
    queryFn: () => account.rateCache.convertCurrency(fromCurrencyCode, toCurrencyCode, amount),
    config: { suspense: true },
  }).data!
}

// NATIVE AMOUNT

/* 
const denomination = getExchangeDenomination({ currencyInfo })
fiatAmount -> convertCurrency -> exchangeAmount -> nativeAmount
const exchangeAmount = convertCurrency(iso:USD, BTC, fiatAmount)
const nativeAmount = denominationToNative({ denomination: exchangeDenomination, amount: exchangeAmount })
*/
export const useNativeAmount = (
  account: EdgeAccount,
  currencyInfo: EdgeCurrencyInfo | EdgeMetaToken,
  fiatCurrencyCode: string,
  fiatAmount: number,
) => {
  const fromCurrencyCode = currencyInfo.currencyCode
  const toCurrencyCode = fiatCurrencyCode
  const exchangeAmount = useQuery({
    queryKey: [{ fromCurrencyCode, toCurrencyCode, fiatAmount }],
    queryFn: () => account.rateCache.convertCurrency(fromCurrencyCode, toCurrencyCode, fiatAmount),
    config: { suspense: true },
  }).data!

  const denomination = getExchangeDenomination({ currencyInfo })
  const nativeAmount = denominationToNative({ denomination, amount: String(exchangeAmount) })

  return nativeAmount
}

// INACTIVE WALLETS
export const useReadInactiveWallet = (account: EdgeAccount, walletId: string) =>
  useQuery({
    queryKey: [walletId, 'inactiveWallet'],
    queryFn: () => account.dataStore.getItem('inactiveWallets', walletId).then(JSON.parse) as Promise<InactiveWallet>,
    config: { suspense: true, cacheTime: 0 },
  }).data!

export const useWriteInactiveWallet = (account: EdgeAccount, wallet: EdgeCurrencyWallet) => {
  const [update] = useMutation(
    () => account.dataStore.setItem('inactiveWallets', wallet.id, JSON.stringify(wallet)),
    // optimisticMutationOptions<void>([walletId, 'inactiveWallet']), // FIXME
  )

  React.useEffect(() => {
    const unsubs = (Object.keys(wallet) as (keyof EdgeCurrencyWallet)[]).map((key) => wallet.watch(key, () => update()))

    update()

    return () => {
      unsubs.forEach((unsub) => unsub())
    }
  }, [account, wallet, update])
}

export type InactiveWallet = {
  id: string
  keys: EdgeCurrencyWallet['keys']
  type: string
  publicWalletInfo: EdgeCurrencyWallet['publicWalletInfo']
  disklet: Record<string, unknown>
  localDisklet: Record<string, unknown>
  displayPrivateSeed: string | null
  displayPublicSeed: string | null
  name: string | null
  fiatCurrencyCode: string
  currencyInfo: EdgeCurrencyWallet['currencyInfo']
  balances: EdgeCurrencyWallet['balances']
  blockHeight: number
  syncRatio: number
  otherMethods: EdgeCurrencyWallet['otherMethods']
}
