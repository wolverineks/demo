import { EdgeCurrencyWallet } from 'edge-core-js'

export const getCurrencyInfoFromCurrencyCode = ({
  wallet,
  currencyCode,
}: {
  wallet: EdgeCurrencyWallet
  currencyCode: string
}) =>
  (wallet.currencyInfo.currencyCode === currencyCode
    ? wallet.currencyInfo
    : wallet.currencyInfo.metaTokens.find((tokenInfo) => tokenInfo.currencyCode === currencyCode))!
