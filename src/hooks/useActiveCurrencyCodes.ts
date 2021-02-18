import { EdgeAccount } from 'edge-core-js'
import { useQuery } from 'react-query'

import { getSortedCurrencyWallets, unique } from '../utils'
import { readEnabledTokenCurrencyCodes, useWatch } from '.'

export const getActiveCurrencyCodes = async (account: EdgeAccount) => {
  const wallets = getSortedCurrencyWallets(account)

  const walletCurrencyCodes = wallets.map((wallet) => wallet.currencyInfo.currencyCode)
  const tokenCurrencyCodes = (await Promise.all(wallets.map((wallet) => readEnabledTokenCurrencyCodes(wallet)))).flat()

  return unique([...walletCurrencyCodes, ...tokenCurrencyCodes])
}

export const useActiveCurrencyCodes = (account: EdgeAccount) => {
  const queryFn = () => getActiveCurrencyCodes(account)
  const queryKey = 'activeCurrencyCodes'
  const { refetch, data } = useQuery(queryKey, queryFn, { suspense: true })

  useWatch(account, 'currencyWallets', () => refetch())

  return data!
}
