import { EdgeCurrencyWallet } from 'edge-core-js'
import { useWatchAll } from 'edge-react-hooks'

export const useCurrencyInfoFromCurrencyCode = ({
  wallet,
  currencyCode,
}: {
  wallet: EdgeCurrencyWallet
  currencyCode: string
}) => {
  useWatchAll(wallet)

  return getCurrencyInfoFromCurrencyCode({ wallet, currencyCode })
}

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
