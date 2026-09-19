import { EdgeAccount } from 'edge-core-js'
import { useQuery } from 'react-query'

import { fiatInfos, getCurrencyInfos, uniqueBy } from '../utils'
import { getConfigTokenInfos, readCustomTokenInfos } from './tokens/utils'

export const getCurrencyInfo = (account: EdgeAccount, currencyCode: string) => {
  return getCurrencyInfos(account).find((currencyInfo) => currencyInfo.currencyCode === currencyCode)
}

export const getTokenInfos = (account: EdgeAccount) => {
  return uniqueBy(
    (tokenInfo) => tokenInfo.currencyCode,
    Object.values(account.currencyConfig).flatMap(getConfigTokenInfos),
  )
}

export const getTokenInfo = (account: EdgeAccount, currencyCode: string) => {
  return getTokenInfos(account).find((tokenInfo) => tokenInfo.currencyCode === currencyCode)
}

export const getFiatInfo = (currencyCode: string) => {
  return fiatInfos.find(
    (fiatInfo) => fiatInfo.isoCurrencyCode === currencyCode || fiatInfo.currencyCode === currencyCode,
  )
}

export const getInfo = (account: EdgeAccount, currencyCode: string) => {
  return getCurrencyInfo(account, currencyCode) || getTokenInfo(account, currencyCode) || getFiatInfo(currencyCode)
}

export const useInfo = (account: EdgeAccount, currencyCode: string) => {
  const known = getInfo(account, currencyCode)
  const { data } = useQuery({
    queryKey: ['info', currencyCode],
    enabled: !known,
    suspense: !known,
    queryFn: async () => {
      const wallets = Object.values(account.currencyWallets)
      for (const wallet of wallets) {
        const tokenInfos = await readCustomTokenInfos(wallet)
        const match = tokenInfos[currencyCode]

        if (match) {
          return match
        }
      }

      throw new Error(`Invalid Currency Code: ${currencyCode}`)
    },
  })

  const info = known || data
  if (!info) throw new Error(`Invalid Currency Code: ${currencyCode}`)

  return info
}
