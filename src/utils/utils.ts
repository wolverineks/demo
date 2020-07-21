import { EdgeAccount, EdgeCurrencyInfo, EdgeCurrencyWallet, EdgeDenomination, EdgeMetaToken } from 'edge-core-js'

export const isUnique = (value: any, index: number, array: any[]) => array.indexOf(value) === index

export const getTokenInfos = (account: EdgeAccount) =>
  Object.values(account.currencyConfig)
    .map(({ currencyInfo: { metaTokens } }) => metaTokens)
    .reduce((result, current) => [...result, ...current], [])

export const getTokenInfoFromCurrencyCode = (account: EdgeAccount, currencyCode: string) =>
  getTokenInfos(account).find((tokenInfo) => tokenInfo.currencyCode === currencyCode)!

export const getCurrencyInfos = (account: EdgeAccount) =>
  Object.values(account.currencyConfig).map(({ currencyInfo }) => currencyInfo)

export const getCurrencyConfig = ({ account, walletType }: { account: EdgeAccount; walletType: string }) =>
  Object.values(account.currencyConfig).find((currencyConfig) => currencyConfig.currencyInfo.walletType === walletType)!

export const getCurrencyInfoFromWalletType = ({ account, walletType }: { account: EdgeAccount; walletType: string }) =>
  getCurrencyConfig({ account, walletType }).currencyInfo

export const getLogo = ({ account, walletType }: { account: EdgeAccount; walletType: string }) =>
  getCurrencyInfoFromWalletType({ account, walletType }).symbolImage

export const nativeToDenomination = ({
  denomination,
  nativeAmount,
}: {
  denomination: EdgeDenomination
  nativeAmount: string
}) => (Number(nativeAmount) / Number(denomination.multiplier)).toFixed(4)

export const denominationToNative = ({ denomination, amount }: { denomination: EdgeDenomination; amount: string }) =>
  (Number(amount) / Number(denomination.multiplier)).toFixed(4)

export const getTokenSymbol = (tokenInfo: EdgeMetaToken) => tokenInfo.denominations[0].symbol

export const getCurrencyCodes = (wallet: EdgeCurrencyWallet) => {
  const {
    currencyInfo: { currencyCode, metaTokens },
  } = wallet

  return [currencyCode, ...metaTokens.map(({ currencyCode }) => currencyCode)]
}

export const getExchangeDenomination = ({ currencyInfo }: { currencyInfo: EdgeCurrencyInfo | EdgeMetaToken }) =>
  currencyInfo.denominations[0]

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
