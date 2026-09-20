import { EdgeAccount, EdgeCurrencyInfo, EdgeCurrencyWallet, EdgeDenomination, EdgeMetaToken, EdgeTokenId } from 'edge-core-js'
import { UseQueryOptions, useMutation, useQuery } from 'react-query'

import { FiatInfo, getCurrencyCodeFromTokenId } from '../utils'
import { convertCurrency } from './rates'
import { assetDenominationKey, getAssetInfo, useAssetInfo, useInfo } from './useInfo'
import { useInvalidateQueries } from './useInvalidateQueries'

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

export const denominatedToDenominated = ({
  amount,
  fromDenomination,
  toDenomination,
}: {
  amount: string
  fromDenomination: EdgeDenomination
  toDenomination: EdgeDenomination
}) => {
  const nativeAmount = denominatedToNative({ amount, denomination: fromDenomination })
  const result = nativeToDenominated({ denomination: toDenomination, nativeAmount })

  return result
}

export const getExchangeDenomination = (info: EdgeCurrencyInfo | EdgeMetaToken | FiatInfo) => info.denominations[0]

export const useExchangeDenomination = (account: EdgeAccount, currencyCode: string) => {
  const info = useInfo(account, currencyCode)

  return getExchangeDenomination(info)
}

export const useNativeDenomination = (account: EdgeAccount, currencyCode: string) => {
  const info = useInfo(account, currencyCode)

  return info.denominations.find(({ multiplier }) => multiplier === '1')
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
  const nativeAmount = useExchangeToNative({ account, currencyCode, exchangeAmount })

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
  const denomination = useExchangeDenomination(account, currencyCode)

  return nativeToDenominated({ denomination, nativeAmount })
}

export const useNativeToExchange = ({
  account,
  currencyCode,
  nativeAmount,
}: {
  account: EdgeAccount
  currencyCode: string
  nativeAmount: string
}) => {
  return nativeToDenominated({
    denomination: useExchangeDenomination(account, currencyCode),
    nativeAmount,
  })
}

export const useExchangeToNative = ({
  account,
  currencyCode,
  exchangeAmount,
}: {
  account: EdgeAccount
  currencyCode: string
  exchangeAmount: string
}) => {
  return denominatedToNative({
    denomination: useExchangeDenomination(account, currencyCode),
    amount: exchangeAmount,
  })
}

export const useReadDisplayDenominationMultiplier = (
  account: EdgeAccount,
  currencyInfo: EdgeCurrencyInfo | EdgeMetaToken | FiatInfo,
  storageKey = currencyInfo.currencyCode,
  queryOptions?: UseQueryOptions<string>,
) => {
  return useQuery({
    queryKey: [storageKey, 'displayDenominationMultiplier'],
    queryFn: () =>
      account.dataStore
        .getItem('displayDenominationMultiplier', storageKey)
        .then(JSON.parse)
        .catch(() => currencyInfo.denominations[0].multiplier),
    suspense: false,
    placeholderData: currencyInfo.denominations[0].multiplier,
    ...queryOptions,
  })
}

export const useWriteDisplayDenominationMultiplier = (
  account: EdgeAccount,
  currencyInfo: EdgeCurrencyInfo | EdgeMetaToken | FiatInfo,
  storageKey = currencyInfo.currencyCode,
) => {
  const queryFn = (displayDenominationMultiplier: string) =>
    account.dataStore.setItem('displayDenominationMultiplier', storageKey, JSON.stringify(displayDenominationMultiplier))

  return useMutation(queryFn, {
    ...useInvalidateQueries([
      [storageKey, 'displayDenominationMultiplier'],
      ['displayDenominationMultiplier', storageKey],
    ]),
  })
}

export const useDisplayDenomination = (account: EdgeAccount, currencyCode: string) => {
  const info = useInfo(account, currencyCode)
  const multiplier =
    useReadDisplayDenominationMultiplier(account, info).data ?? info.denominations[0].multiplier
  const displayDenomination =
    info.denominations.find((denomination) => denomination.multiplier === multiplier) || info.denominations[0]

  if (!displayDenomination) {
    throw new Error('Invalid Denomination Multiplier')
  }

  return [displayDenomination, useWriteDisplayDenominationMultiplier(account, info).mutateAsync] as const
}

export const useDenominations = (account: EdgeAccount, currencyCode: string) => {
  const [display, setDisplay] = useDisplayDenomination(account, currencyCode)

  return {
    display,
    setDisplay,
    native: useNativeDenomination(account, currencyCode),
    exchange: useExchangeDenomination(account, currencyCode),
    all: useInfo(account, currencyCode).denominations,
  }
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

export const useTickerFiatAmount = (
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
  queryOptions?: UseQueryOptions<number>,
) => {
  const fiatDenominations = useDenominations(account, fiatCurrencyCode)
  const exchangeAmount = useNativeToExchange({
    account,
    currencyCode: fromCurrencyCode,
    nativeAmount,
  })

  const { data: fiatExchangeAmount } = useQuery({
    queryKey: [{ fromCurrencyCode, fiatCurrencyCode, exchangeAmount }],
    queryFn: () => convertCurrency(fromCurrencyCode, fiatCurrencyCode, Number(exchangeAmount)),
    suspense: false,
    placeholderData: 0,
    refetchInterval: 30_000,
    ...queryOptions,
  })

  const fiatNativeAmount = denominatedToNative({
    amount: String(fiatExchangeAmount)!,
    denomination: fiatDenominations.exchange,
  })

  return nativeToDenominated({
    nativeAmount: fiatNativeAmount,
    denomination: fiatDenominations.display,
  })
}

export const useFiatAmount = (
  {
    account,
    wallet,
    tokenId,
    nativeAmount,
    fiatCurrencyCode,
  }: {
    account: EdgeAccount
    wallet: EdgeCurrencyWallet
    tokenId: EdgeTokenId
    nativeAmount: string
    fiatCurrencyCode: string
  },
  queryOptions?: UseQueryOptions<number>,
) => {
  const fiatDenominations = useDenominations(account, fiatCurrencyCode)
  const fromCurrencyCode = getCurrencyCodeFromTokenId(wallet, tokenId)
  const exchangeAmount = useAssetNativeToExchange({ wallet, tokenId, nativeAmount })

  const { data: fiatExchangeAmount } = useQuery({
    queryKey: [{ fromCurrencyCode, fiatCurrencyCode, exchangeAmount }],
    queryFn: () => convertCurrency(fromCurrencyCode, fiatCurrencyCode, Number(exchangeAmount)),
    suspense: false,
    placeholderData: 0,
    refetchInterval: 30_000,
    ...queryOptions,
  })

  const fiatNativeAmount = denominatedToNative({
    amount: String(fiatExchangeAmount)!,
    denomination: fiatDenominations.exchange,
  })
  const fiatDisplayAmount = nativeToDenominated({
    nativeAmount: fiatNativeAmount,
    denomination: fiatDenominations.display,
  })

  return fiatDisplayAmount
}

export const useAssetDisplayDenomination = (
  account: EdgeAccount,
  wallet: EdgeCurrencyWallet,
  tokenId: EdgeTokenId,
) => {
  const info = useAssetInfo(wallet, tokenId)
  const storageKey = assetDenominationKey(wallet, tokenId)
  const multiplier =
    useReadDisplayDenominationMultiplier(account, info, storageKey).data ?? info.denominations[0].multiplier
  const displayDenomination =
    info.denominations.find((denomination) => denomination.multiplier === multiplier) || info.denominations[0]

  if (!displayDenomination) {
    throw new Error('Invalid Denomination Multiplier')
  }

  return [displayDenomination, useWriteDisplayDenominationMultiplier(account, info, storageKey).mutateAsync] as const
}

export const useAssetExchangeDenomination = (wallet: EdgeCurrencyWallet, tokenId: EdgeTokenId) =>
  getExchangeDenomination(getAssetInfo(wallet, tokenId))

export const useAssetNativeToExchange = ({
  wallet,
  tokenId,
  nativeAmount,
}: {
  wallet: EdgeCurrencyWallet
  tokenId: EdgeTokenId
  nativeAmount: string
}) =>
  nativeToDenominated({
    denomination: useAssetExchangeDenomination(wallet, tokenId),
    nativeAmount,
  })

export const useAssetDenominations = (account: EdgeAccount, wallet: EdgeCurrencyWallet, tokenId: EdgeTokenId) => {
  const [display, setDisplay] = useAssetDisplayDenomination(account, wallet, tokenId)
  const info = useAssetInfo(wallet, tokenId)

  return {
    display,
    setDisplay,
    exchange: useAssetExchangeDenomination(wallet, tokenId),
    all: info.denominations,
  }
}

export const useAssetDisplayAmount = ({
  account,
  wallet,
  tokenId,
  nativeAmount,
}: {
  account: EdgeAccount
  wallet: EdgeCurrencyWallet
  tokenId: EdgeTokenId
  nativeAmount: string
}) => {
  const [denomination] = useAssetDisplayDenomination(account, wallet, tokenId)

  return {
    amount: nativeToDenominated({ denomination, nativeAmount }),
    denomination,
    ...denomination,
  }
}
