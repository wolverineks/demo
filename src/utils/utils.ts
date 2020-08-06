import { EdgeAccount, EdgeCurrencyWallet, EdgeDenomination } from 'edge-core-js'

import { getFiatInfo } from '../Fiat'

export const isUnique = (value: any, index: number, array: any[]) => array.indexOf(value) === index

export const getWalletTypes = (account: EdgeAccount) =>
  getCurrencyInfos(account).map(({ displayName, walletType, ...currencyInfo }) => ({
    name: displayName,
    type: walletType,
    ...currencyInfo,
  }))

export const getCurrencyInfos = (account: EdgeAccount) =>
  Object.values(account.currencyConfig).map(({ currencyInfo }) => currencyInfo)

export const getTokenInfos = (account: EdgeAccount) =>
  Object.values(account.currencyConfig)
    .map(({ currencyInfo: { metaTokens } }) => metaTokens)
    .reduce((result, current) => [...result, ...current], [])

export const getCurrencyInfo = (account: EdgeAccount, currencyCode: string) =>
  getCurrencyInfos(account).find((currencyInfo) => currencyInfo.currencyCode === currencyCode)!

export const getTokenInfo = (account: EdgeAccount, currencyCode: string) =>
  getTokenInfos(account).find((tokenInfo) => tokenInfo.currencyCode === currencyCode)!

export const getInfo = (account: EdgeAccount, currencyCode: string) =>
  getCurrencyInfo(account, currencyCode) || getTokenInfo(account, currencyCode) || getFiatInfo(currencyCode)

export const getLogo = (account: EdgeAccount, currencyCode: string) => getInfo(account, currencyCode).symbolImage

export const getExchangeDenomination = (account: EdgeAccount, currencyCode: string) =>
  getInfo(account, currencyCode).denominations[0]

export const nativeToDenominated = ({
  denomination,
  nativeAmount,
}: {
  denomination: EdgeDenomination
  nativeAmount: string
}) => String(Number(nativeAmount) / Number(denomination.multiplier))

export const denominatedToNative = ({ denomination, amount }: { denomination: EdgeDenomination; amount: string }) =>
  String(Number(amount) * Number(denomination.multiplier))

export const getCurrencyCodes = (wallet: EdgeCurrencyWallet) => {
  const {
    currencyInfo: { currencyCode, metaTokens },
  } = wallet

  return [currencyCode, ...metaTokens.map(({ currencyCode }) => currencyCode)]
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
