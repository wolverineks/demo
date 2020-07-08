import { EdgeAccount, EdgeCurrencyInfo, EdgeMetaToken } from 'edge-core-js'
import { useQuery } from 'react-query'

import { getExchangeDenomination, nativeToDenomination } from '../utils'

export const useFiatAmount = ({
  account,
  currencyInfo,
  toCurrencyCode,
  nativeAmount,
}: {
  account: EdgeAccount
  currencyInfo: EdgeCurrencyInfo | EdgeMetaToken
  toCurrencyCode: string
  nativeAmount: string
}) => {
  const denomination = getExchangeDenomination({ currencyInfo })
  const exchangeAmount = nativeToDenomination({ denomination, nativeAmount })
  const fromCurrencyCode = currencyInfo.currencyCode
  const amount = Number(exchangeAmount)

  return useQuery({
    queryKey: ['fiatAmount', fromCurrencyCode, toCurrencyCode, exchangeAmount],
    queryFn: () => account.rateCache.convertCurrency(fromCurrencyCode, toCurrencyCode, amount),
    config: { suspense: true },
  }).data!
}
