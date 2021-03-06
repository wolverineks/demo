import { EdgeAccount } from 'edge-core-js'
import { useQuery } from 'react-query'

import { fiatInfos, getCurrencyInfos } from '../utils'
import { readCustomTokenInfos } from '.'

export const getCurrencyInfo = (account: EdgeAccount, currencyCode: string) => {
  return getCurrencyInfos(account).find((currencyInfo) => currencyInfo.currencyCode === currencyCode)
}

export const getTokenInfos = (account: EdgeAccount) => {
  return Object.values(account.currencyConfig)
    .map(
      ({ currencyInfo: { metaTokens, transactionExplorer, addressExplorer } }) =>
        metaTokens.map((tokenInfo) => ({ ...tokenInfo, transactionExplorer, addressExplorer })), // copy network explorers into token infos
    )
    .reduce((result, current) => [...result, ...current], [])
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
  const { data } = useQuery(['info', currencyCode], async () => {
    const info = getInfo(account, currencyCode)

    if (info) {
      return info
    }

    const wallets = Object.values(account.currencyWallets)
    for (const wallet of wallets) {
      const tokenInfos = await readCustomTokenInfos(wallet)
      const match = tokenInfos[currencyCode]

      if (match) {
        return match
      }
    }
  })

  if (!data) throw new Error(`Invalid Currency Code: ${currencyCode}`)

  return data
}
