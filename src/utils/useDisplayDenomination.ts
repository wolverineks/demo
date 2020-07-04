import { EdgeAccount, EdgeCurrencyInfo, EdgeDenomination, EdgeMetaToken } from 'edge-core-js'
import * as React from 'react'
import { queryCache, useMutation, useQuery } from 'react-query'

export const useReadDisplayDenominationMultiplier = ({
  account,
  currencyInfo,
}: {
  account: EdgeAccount
  currencyInfo: EdgeCurrencyInfo | EdgeMetaToken
}) =>
  useQuery({
    queryKey: ['displayDenomination', currencyInfo.currencyCode],
    queryFn: () =>
      account.dataStore
        .getItem('displayDenominationMultipliers', currencyInfo.currencyCode)
        .catch(() => currencyInfo.denominations[0]),
    config: { suspense: true },
  })

export const useWriteDisplayDenominationMultiplier = ({
  account,
  currencyInfo,
}: {
  account: EdgeAccount
  currencyInfo: EdgeCurrencyInfo | EdgeMetaToken
}) =>
  useMutation(
    (displayDenominationMultiplier: string) =>
      account.dataStore.setItem(
        'displayDenominationMultipliers',
        currencyInfo.currencyCode,
        displayDenominationMultiplier,
      ),
    {
      onMutate: (multiplier: string) => {
        queryCache.cancelQueries(['displayDenomination', currencyInfo.currencyCode])
        const previous = queryCache.getQueryData(['displayDenomination', currencyInfo.currencyCode])
        queryCache.setQueryData(['displayDenomination', currencyInfo.currencyCode], multiplier)
        const rollback = () => queryCache.setQueryData(['displayDenomination', currencyInfo.currencyCode], previous)

        return rollback
      },
      onError: (_err, _attemptedValue, rollback) => rollback(),
      onSettled: () => queryCache.invalidateQueries(['displayDenomination', currencyInfo.currencyCode]),
    },
  )

export const useDisplayDenominationMultiplier = ({
  account,
  currencyInfo,
}: {
  account: EdgeAccount
  currencyInfo: EdgeCurrencyInfo | EdgeMetaToken
}) =>
  [
    useReadDisplayDenominationMultiplier({ account, currencyInfo }).data,
    useWriteDisplayDenominationMultiplier({ account, currencyInfo })[0],
  ] as const

export const useDisplayDenomination = ({
  account,
  currencyInfo,
}: {
  account: EdgeAccount
  currencyInfo: EdgeCurrencyInfo | EdgeMetaToken
}) => {
  const [multiplier, write] = useDisplayDenominationMultiplier({
    account,
    currencyInfo,
  })

  return [
    currencyInfo.denominations.find((denomination) => denomination.multiplier === multiplier) ||
      currencyInfo.denominations[0],
    React.useCallback((denomination: EdgeDenomination) => write(denomination.multiplier), [write]),
  ] as const
}
