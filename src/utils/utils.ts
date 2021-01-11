import { EdgeAccount, EdgeContext, EdgeCurrencyWallet, EdgeDenomination, EdgeTransaction } from 'edge-core-js'

import { FiatInfo, fiatInfos } from './fiatInfos'

export const isUnique = (value: any, index: number, array: any[]) => array.indexOf(value) === index

// EDGE CONTEXT
export const getAccountsWithPinLogin = (context: EdgeContext) => {
  return context.localUsers.filter(({ pinLoginEnabled }) => pinLoginEnabled)
}

// EDGE ACCOUNT
export const getActiveInfos = async (account: EdgeAccount) => {
  const wallets = getSortedCurrencyWallets(account)
  const walletCurrencyCodes = wallets.map((wallet) => wallet.currencyInfo.currencyCode)
  const tokenCurrencyCodes = await Promise.all(wallets.map((wallet) => wallet.getEnabledTokens()))
  const allCurrencyCodes = [...walletCurrencyCodes, ...tokenCurrencyCodes].flat().filter(isUnique)

  return allCurrencyCodes.map((currencyCode) => getInfo(account, currencyCode))
}

export const getDeletedWalletIds = (account: EdgeAccount) => {
  return account.allKeys.filter(({ deleted }) => deleted).map(({ id }) => id)
}

export const getSortedCurrencyWallets = (account: EdgeAccount) => {
  return account.activeWalletIds.map((id) => account.currencyWallets[id]).filter(Boolean)
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

export const getFiatInfo = (currencyCode: string): FiatInfo & { denominations: EdgeDenomination[] } => {
  const info = fiatInfos.find((fiatInfo) => fiatInfo.isoCurrencyCode.includes(currencyCode))!

  return {
    ...info,
    denominations: [{ name: info.currencyCode, symbol: info.symbol, multiplier: '1' }],
  }
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

export const getBalance = (wallet: EdgeCurrencyWallet, currencyCode: string) => {
  return wallet.balances[currencyCode]
}

export const getTxUrl = (account: EdgeAccount, transaction: EdgeTransaction) => {
  return getInfo(account, transaction.currencyCode).transactionExplorer.replace('%s', transaction.txid)
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
