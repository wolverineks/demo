import {
  EdgeAccount,
  EdgeCurrencyInfo,
  EdgeCurrencyWallet,
  EdgeDenomination,
  EdgeMetaToken,
  EdgeTokenId,
} from 'edge-core-js'
import { UseQueryOptions, useMutation, useQuery } from 'react-query'

import { FiatInfo, getCurrencyCodeFromTokenId } from '../utils'
import { convertCurrency } from './rates'
import { getFiatInfo, getTokenInfo, tokenDenominationKey, useTokenInfo } from './useInfo'
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

export const useNativeToExchange = ({
  info,
  nativeAmount,
}: {
  info: EdgeCurrencyInfo | EdgeMetaToken | FiatInfo
  nativeAmount: string
}) => {
  return nativeToDenominated({
    denomination: getExchangeDenomination(info),
    nativeAmount,
  })
}

export const useExchangeToNative = ({
  info,
  exchangeAmount,
}: {
  info: EdgeCurrencyInfo | EdgeMetaToken | FiatInfo
  exchangeAmount: string
}) => {
  return denominatedToNative({
    denomination: getExchangeDenomination(info),
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
    account.dataStore.setItem(
      'displayDenominationMultiplier',
      storageKey,
      JSON.stringify(displayDenominationMultiplier),
    )

  return useMutation(queryFn, {
    ...useInvalidateQueries([
      [storageKey, 'displayDenominationMultiplier'],
      ['displayDenominationMultiplier', storageKey],
    ]),
  })
}

export const useDisplayDenomination = (
  account: EdgeAccount,
  info: EdgeCurrencyInfo | EdgeMetaToken | FiatInfo,
  storageKey = info.currencyCode,
) => {
  const multiplier =
    useReadDisplayDenominationMultiplier(account, info, storageKey).data ?? info.denominations[0].multiplier
  const displayDenomination =
    info.denominations.find((denomination) => denomination.multiplier === multiplier) || info.denominations[0]

  if (!displayDenomination) {
    throw new Error('Invalid Denomination Multiplier')
  }

  return [displayDenomination, useWriteDisplayDenominationMultiplier(account, info, storageKey).mutateAsync] as const
}

export const useDenominations = (
  account: EdgeAccount,
  info: EdgeCurrencyInfo | EdgeMetaToken | FiatInfo,
  storageKey = info.currencyCode,
) => {
  const [display, setDisplay] = useDisplayDenomination(account, info, storageKey)

  return {
    display,
    setDisplay,
    native: info.denominations.find(({ multiplier }) => multiplier === '1'),
    exchange: getExchangeDenomination(info),
    all: info.denominations,
  }
}

export const useDisplayAmount = ({
  account,
  nativeAmount,
  info,
  storageKey,
}: {
  account: EdgeAccount
  nativeAmount: string
  info: EdgeCurrencyInfo | EdgeMetaToken | FiatInfo
  storageKey?: string
}) => {
  const [denomination] = useDisplayDenomination(account, info, storageKey)

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
    fromInfo,
    fiatCurrencyCode,
  }: {
    account: EdgeAccount
    nativeAmount: string
    fromInfo: EdgeCurrencyInfo | EdgeMetaToken
    fiatCurrencyCode: string
  },
  queryOptions?: UseQueryOptions<number>,
) => {
  const fiatInfo = getFiatInfo(fiatCurrencyCode)
  const fiatDenominations = useDenominations(account, fiatInfo)
  const exchangeAmount = useNativeToExchange({ info: fromInfo, nativeAmount })
  const fromCurrencyCode = fromInfo.currencyCode

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
  const fiatInfo = getFiatInfo(fiatCurrencyCode)
  const fiatDenominations = useDenominations(account, fiatInfo)
  const fromCurrencyCode = getCurrencyCodeFromTokenId(wallet, tokenId)
  const exchangeAmount = useTokenNativeToExchange({ wallet, tokenId, nativeAmount })

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

export const useTokenDisplayDenomination = (account: EdgeAccount, wallet: EdgeCurrencyWallet, tokenId: EdgeTokenId) => {
  const info = useTokenInfo(wallet, tokenId)
  const storageKey = tokenDenominationKey(wallet.currencyInfo.pluginId, tokenId)
  const multiplier =
    useReadDisplayDenominationMultiplier(account, info, storageKey).data ?? info.denominations[0].multiplier
  const displayDenomination =
    info.denominations.find((denomination) => denomination.multiplier === multiplier) || info.denominations[0]

  if (!displayDenomination) {
    throw new Error('Invalid Denomination Multiplier')
  }

  return [displayDenomination, useWriteDisplayDenominationMultiplier(account, info, storageKey).mutateAsync] as const
}

export const useTokenExchangeDenomination = (wallet: EdgeCurrencyWallet, tokenId: EdgeTokenId) =>
  getExchangeDenomination(getTokenInfo(wallet, tokenId))

export const useTokenNativeToExchange = ({
  wallet,
  tokenId,
  nativeAmount,
}: {
  wallet: EdgeCurrencyWallet
  tokenId: EdgeTokenId
  nativeAmount: string
}) =>
  nativeToDenominated({
    denomination: useTokenExchangeDenomination(wallet, tokenId),
    nativeAmount,
  })

export const useTokenDenominations = (account: EdgeAccount, wallet: EdgeCurrencyWallet, tokenId: EdgeTokenId) => {
  const [display, setDisplay] = useTokenDisplayDenomination(account, wallet, tokenId)
  const info = useTokenInfo(wallet, tokenId)

  return {
    display,
    setDisplay,
    exchange: useTokenExchangeDenomination(wallet, tokenId),
    all: info.denominations,
  }
}
