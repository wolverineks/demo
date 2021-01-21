import { EdgeAccount, EdgeCurrencyInfo, EdgeDenomination, EdgeMetaToken } from 'edge-core-js'
import React from 'react'
import { UseQueryOptions, useMutation, useQuery } from 'react-query'

import {
  FiatInfo,
  denominatedToNative,
  exchangeToNative,
  getDenominations,
  getExchangeDenomination,
  getInfo,
  getNativeDenomination,
  nativeToDenominated,
  nativeToExchange,
} from '../utils'
import { useInvalidateQueries } from './useInvalidateQueries'

export const useReadDisplayDenominationMultiplier = (
  account: EdgeAccount,
  currencyInfo: EdgeCurrencyInfo | EdgeMetaToken | FiatInfo,
  queryOptions?: UseQueryOptions<string | EdgeDenomination>,
) => {
  return useQuery({
    queryKey: [currencyInfo.currencyCode, 'displayDenominationMultiplier'],
    queryFn: () =>
      account.dataStore
        .getItem('displayDenominationMultiplier', currencyInfo.currencyCode)
        .catch(() => currencyInfo.denominations[0]),
    ...queryOptions,
  })
}

export const useWriteDisplayDenominationMultiplier = (
  account: EdgeAccount,
  currencyInfo: EdgeCurrencyInfo | EdgeMetaToken | FiatInfo,
) => {
  const queryFn = (displayDenominationMultiplier: string) =>
    account.dataStore.setItem('displayDenominationMultiplier', currencyInfo.currencyCode, displayDenominationMultiplier)

  return useMutation(queryFn, {
    ...useInvalidateQueries([
      [currencyInfo.currencyCode, 'displayDenominationMultiplier'],
      ['displayDenominationMultiplier', currencyInfo.currencyCode], // invalidate dataStore
    ]),
  })
}

export const useDisplayDenominationMultiplier = (
  account: EdgeAccount,
  currencyInfo: EdgeCurrencyInfo | EdgeMetaToken | FiatInfo,
) => {
  return [
    useReadDisplayDenominationMultiplier(account, currencyInfo).data,
    useWriteDisplayDenominationMultiplier(account, currencyInfo).mutate,
  ] as const
}

export const useDisplayDenomination = (account: EdgeAccount, currencyCode: string) => {
  const currencyInfo = getInfo(account, currencyCode)
  const [multiplier, write] = useDisplayDenominationMultiplier(account, currencyInfo)

  return [
    currencyInfo.denominations.find((denomination) => denomination.multiplier === multiplier) ||
      currencyInfo.denominations[0],
    React.useCallback((denomination: EdgeDenomination) => write(denomination.multiplier), [write]),
  ] as const
}

export const useDenominations = (account: EdgeAccount, currencyCode: string) => {
  const [display, setDisplay] = useDisplayDenomination(account, currencyCode)

  return {
    display,
    setDisplay,
    native: getNativeDenomination(account, currencyCode),
    exchange: getExchangeDenomination(account, currencyCode),
    all: getDenominations(account, currencyCode),
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

/**
 * crypto nativeAmount -> fiat exchangeAmount
 *
 * ```
 * const fiatExchangeAmount = useFiatAmount({
 *   account, nativeAmount,
 *   fromCurrencyCode: 'BTC',
 *   toCurrencyCode: 'iso:USD'
 * })
 * ```
 */
export const useFiatAmount = (
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

  const exchangeAmount = nativeToExchange({
    account,
    currencyCode: fromCurrencyCode,
    nativeAmount,
  })

  const { data, refetch } = useQuery({
    queryKey: [{ fromCurrencyCode, fiatCurrencyCode, exchangeAmount }],
    queryFn: () => account.rateCache.convertCurrency(fromCurrencyCode, fiatCurrencyCode, Number(exchangeAmount)),
    suspense: true,
    ...queryOptions,
  })

  React.useEffect(() => {
    const unsub = account.rateCache.on('update', () => refetch())

    return () => {
      unsub()
    }
  }, [account.rateCache, exchangeAmount, fiatCurrencyCode, fromCurrencyCode, refetch])

  const fiatNativeAmount = denominatedToNative({
    amount: String(data)!,
    denomination: fiatDenominations.exchange,
  })
  const fiatDisplayAmount = nativeToDenominated({
    nativeAmount: fiatNativeAmount,
    denomination: fiatDenominations.display,
  })

  return fiatDisplayAmount
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
  const nativeAmount = exchangeToNative({ account, currencyCode, exchangeAmount })

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
  const denomination = getExchangeDenomination(account, currencyCode)

  return nativeToDenominated({ denomination, nativeAmount })
}
