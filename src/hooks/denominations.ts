import { EdgeAccount, EdgeCurrencyInfo, EdgeDenomination, EdgeMetaToken } from 'edge-core-js'
import { UseQueryOptions, useMutation, useQuery } from 'react-query'

import { FiatInfo } from '../utils'
import { useOnRateChange } from './edgeAccount'
import { useInfo } from './useInfo'
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

export const useReadDisplayDenomination = (
  account: EdgeAccount,
  currencyInfo: EdgeCurrencyInfo | EdgeMetaToken | FiatInfo,
  queryOptions?: UseQueryOptions<EdgeDenomination>,
) => {
  return useQuery({
    queryKey: [currencyInfo.currencyCode, 'displayDenomination'],
    queryFn: () =>
      account.dataStore
        .getItem('displayDenomination', currencyInfo.currencyCode)
        .then(JSON.parse)
        .catch(() => currencyInfo.denominations[0]),
    ...queryOptions,
  })
}

export const useWriteDisplayDenomination = (
  account: EdgeAccount,
  currencyInfo: EdgeCurrencyInfo | EdgeMetaToken | FiatInfo,
) => {
  const queryFn = (displayDenomination: EdgeDenomination) =>
    account.dataStore.setItem('displayDenomination', currencyInfo.currencyCode, JSON.stringify(displayDenomination))

  return useMutation(queryFn, {
    ...useInvalidateQueries([
      [currencyInfo.currencyCode, 'displayDenomination'],
      ['displayDenomination', currencyInfo.currencyCode], // invalidate dataStore
    ]),
  })
}

export const useDisplayDenomination = (account: EdgeAccount, currencyCode: string) => {
  const info = useInfo(account, currencyCode)

  return [useReadDisplayDenomination(account, info).data!, useWriteDisplayDenomination(account, info).mutate] as const
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

  const exchangeAmount = useNativeToExchange({
    account,
    currencyCode: fromCurrencyCode,
    nativeAmount,
  })

  const { data: fiatExchangeAmount, refetch } = useQuery({
    queryKey: [{ fromCurrencyCode, fiatCurrencyCode, exchangeAmount }],
    queryFn: () => account.rateCache.convertCurrency(fromCurrencyCode, fiatCurrencyCode, Number(exchangeAmount)),
    suspense: true,
    ...queryOptions,
  })

  useOnRateChange(account, () => refetch())

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
