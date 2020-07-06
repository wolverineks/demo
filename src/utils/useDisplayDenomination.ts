import { EdgeAccount, EdgeCurrencyInfo, EdgeDenomination, EdgeMetaToken } from 'edge-core-js'
import * as React from 'react'
import { useMutation, useQuery } from 'react-query'

import { optimisticMutationOptions } from './optimisticMutationOptions'

const queryKey = (currencyCode: string) => ['displayDenominationMultiplier', currencyCode] as const

export const useReadDisplayDenominationMultiplier = ({
  account,
  currencyInfo,
}: {
  account: EdgeAccount
  currencyInfo: EdgeCurrencyInfo | EdgeMetaToken
}) =>
  useQuery({
    queryKey: queryKey(currencyInfo.currencyCode),
    queryFn: () =>
      account.dataStore
        .getItem('displayDenominationMultiplier', currencyInfo.currencyCode)
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
        'displayDenominationMultiplier',
        currencyInfo.currencyCode,
        displayDenominationMultiplier,
      ),
    optimisticMutationOptions(queryKey(currencyInfo.currencyCode)),
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
