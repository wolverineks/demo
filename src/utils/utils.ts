import { EdgeAccount, EdgeCurrencyInfo, EdgeCurrencyWallet, EdgeDenomination, EdgeMetaToken } from 'edge-core-js'

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
  getCurrencyInfo(account, currencyCode) || getTokenInfo(account, currencyCode)

export const getLogo = (account: EdgeAccount, currencyCode: string) => getInfo(account, currencyCode).symbolImage

export const nativeToDenomination = ({
  denomination,
  nativeAmount,
}: {
  denomination: EdgeDenomination
  nativeAmount: string
}) => String(Number(nativeAmount) / Number(denomination.multiplier))

export const denominationToNative = ({ denomination, amount }: { denomination: EdgeDenomination; amount: string }) =>
  String(Number(amount) * Number(denomination.multiplier))

export const getTokenSymbol = (tokenInfo: EdgeMetaToken) => tokenInfo.denominations[0].symbol

export const getCurrencyCodes = (wallet: EdgeCurrencyWallet) => {
  const {
    currencyInfo: { currencyCode, metaTokens },
  } = wallet

  return [currencyCode, ...metaTokens.map(({ currencyCode }) => currencyCode)]
}

export const getExchangeDenomination = (currencyInfo: EdgeCurrencyInfo | EdgeMetaToken) => currencyInfo.denominations[0]

export const getExchangeDenominationFromCC = ({
  account,
  currencyCode,
}: {
  account: EdgeAccount
  currencyCode: string
}) => {
  const currencyInfo = getCurrencyInfos(account).find((currencyInfo) => currencyInfo.currencyCode === currencyCode)!

  return currencyInfo.denominations[0]
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
    const exchangeAmount = nativeToDenomination({
      nativeAmount: String(nativeAmount),
      denomination: exchangeDenominations[currencyCode],
    })
    account.rateCache.convertCurrency(currencyCode, toCurrencyCode, Number(exchangeAmount))
  })

  return accountBalance
}
