import { EdgeAccount, EdgeContext, EdgeCurrencyWallet, EdgeDenomination } from 'edge-core-js'

import { getFiatInfo } from '../Fiat'

export const isUnique = (value: any, index: number, array: any[]) => array.indexOf(value) === index

// EDGE CONTEXT
export const getAccountsWithPinLogin = (context: EdgeContext) => {
  return context.localUsers.filter(({ pinLoginEnabled }) => pinLoginEnabled)
}

// EDGE ACCOUNT
export const getActiveInfos = (account: EdgeAccount) => {
  return getSortedCurrencyWallets(account)
    .map((wallet) => Object.keys(wallet.balances))
    .flat()
    .filter(isUnique)
    .map((currencyCode) => getInfo(account, currencyCode))
}

export const getDeletedWalletIds = (account: EdgeAccount) => {
  return account.allKeys.filter(({ deleted }) => deleted).map(({ id }) => id)
}

export const getSortedCurrencyWallets = (account: EdgeAccount) => {
  return account.activeWalletIds.map((id) => account.currencyWallets[id]).filter(Boolean)
}

export const getAccountBalance = async (account: EdgeAccount, { toCurrencyCode }: { toCurrencyCode: string }) => {
  const accountBalances: Record<string, number> = {}
  const exchangeDenominations: Record<string, EdgeDenomination> = {}

  const wallets = Object.values(account.currencyWallets)
  wallets.forEach(({ currencyInfo, balances: walletBalances }) =>
    [currencyInfo, ...currencyInfo.metaTokens].forEach(({ currencyCode, denominations }) => {
      exchangeDenominations[currencyCode] = denominations[0]
      accountBalances[currencyCode] = (accountBalances[currencyCode] || 0) + Number(walletBalances[currencyCode] || 0)
    }),
  )

  const accountBalance = 0

  Object.entries(accountBalances).forEach(async ([currencyCode, nativeAmount]) => {
    const exchangeAmount = nativeToDenominated({
      nativeAmount: String(nativeAmount),
      denomination: exchangeDenominations[currencyCode],
    })
    account.rateCache.convertCurrency(currencyCode, toCurrencyCode, Number(exchangeAmount))
  })

  return accountBalance
}

export const getWalletTypes = (account: EdgeAccount) => {
  return getCurrencyInfos(account).map(({ displayName, walletType, ...currencyInfo }) => ({
    name: displayName,
    type: walletType,
    ...currencyInfo,
  }))
}

export const getCurrencyInfos = (account: EdgeAccount) => {
  return Object.values(account.currencyConfig).map(({ currencyInfo }) => currencyInfo)
}

export const getTokenInfos = (account: EdgeAccount) => {
  return Object.values(account.currencyConfig)
    .map(({ currencyInfo: { metaTokens } }) => metaTokens)
    .reduce((result, current) => [...result, ...current], [])
}

export const getCurrencyInfo = (account: EdgeAccount, currencyCode: string) => {
  return getCurrencyInfos(account).find((currencyInfo) => currencyInfo.currencyCode === currencyCode)!
}

export const getTokenInfo = (account: EdgeAccount, currencyCode: string) => {
  return getTokenInfos(account).find((tokenInfo) => tokenInfo.currencyCode === currencyCode)!
}

export const getInfo = (account: EdgeAccount, currencyCode: string) => {
  return getCurrencyInfo(account, currencyCode) || getTokenInfo(account, currencyCode) || getFiatInfo(currencyCode)
}

export const getLogo = (account: EdgeAccount, currencyCode: string) => {
  return getInfo(account, currencyCode).symbolImage
}

export const getExchangeDenomination = (account: EdgeAccount, currencyCode: string) => {
  return getInfo(account, currencyCode).denominations[0]
}

// EDGE CURRENCY WALLET
export const getAvailableTokens = (wallet: EdgeCurrencyWallet) => {
  return wallet.currencyInfo.metaTokens.map(({ currencyCode }) => currencyCode)
}

export const getCurrencyCodes = (wallet: EdgeCurrencyWallet) => {
  const {
    currencyInfo: { currencyCode, metaTokens },
  } = wallet

  return [currencyCode, ...metaTokens.map(({ currencyCode }) => currencyCode)]
}

export const getBalance = (wallet: EdgeCurrencyWallet, currencyCode: string) => {
  return wallet.balances[currencyCode]
}

// DENOMINATIONS
export const nativeToDenominated = ({
  denomination,
  nativeAmount,
}: {
  denomination: EdgeDenomination
  nativeAmount: string
}) => {
  return String(Number(nativeAmount) / Number(denomination.multiplier))
}

export const denominatedToNative = ({ denomination, amount }: { denomination: EdgeDenomination; amount: string }) => {
  return String(Number(amount) * Number(denomination.multiplier))
}

export const nativeToExchange = ({
  account,
  currencyCode,
  nativeAmount,
}: {
  account: EdgeAccount
  currencyCode: string
  nativeAmount: string
}) => {
  return nativeToDenominated({
    denomination: getExchangeDenomination(account, currencyCode),
    nativeAmount,
  })
}

export const exchangeToNative = ({
  account,
  currencyCode,
  exchangeAmount,
}: {
  account: EdgeAccount
  currencyCode: string
  exchangeAmount: string
}) => {
  return denominatedToNative({
    denomination: getExchangeDenomination(account, currencyCode),
    amount: exchangeAmount,
  })
}
