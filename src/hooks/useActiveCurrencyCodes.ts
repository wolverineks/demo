import { EdgeAccount } from 'edge-core-js'
import { useQuery } from 'react-query'

import { unique } from '../utils'
import { readEnabledTokenCurrencyCodes } from './tokens'
import { useWatch } from './watch'

export const getActiveCurrencyCodes = async (account: EdgeAccount) => {
  const wallets = await Promise.all(account.activeWalletIds.map((id) => account.waitForCurrencyWallet(id)))
  const walletCurrencyCodes = wallets.map((wallet) => wallet.currencyInfo.currencyCode)
  const tokenCurrencyCodes = (await Promise.all(wallets.map((wallet) => readEnabledTokenCurrencyCodes(wallet)))).flat()

  return unique([...walletCurrencyCodes, ...tokenCurrencyCodes])
}

export const useActiveCurrencyCodes = (account: EdgeAccount) => {
  useWatch(account, 'activeWalletIds')
  useWatch(account, 'currencyWallets')

  const { data } = useQuery({
    queryKey: ['activeCurrencyCodes', ...account.activeWalletIds],
    queryFn: () => getActiveCurrencyCodes(account),
    suspense: true,
  })

  return data!
}
