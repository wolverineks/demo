import { EdgeAccount, EdgeTokenId } from 'edge-core-js'
import React from 'react'

import { fiatInfos, getCurrencyCodeFromTokenId, getWalletTokenIds, uniqueBy } from '../utils'
import { useRerender } from './useRerender'
import { useWatch } from './watch'

export type ExchangeInfo = {
  pluginId: string
  tokenId: EdgeTokenId
  currencyCode: string
  fiatCurrencyCode: string
}

export const getExchangeInfos = (account: EdgeAccount): ExchangeInfo[] =>
  uniqueBy(
    ({ pluginId, tokenId, fiatCurrencyCode }) => `${pluginId}:${tokenId ?? 'native'}_${fiatCurrencyCode}`,
    Object.values(account.currencyWallets).flatMap((wallet) =>
      getWalletTokenIds(wallet).map((tokenId) => ({
        pluginId: wallet.currencyInfo.pluginId,
        tokenId,
        currencyCode: getCurrencyCodeFromTokenId(wallet, tokenId),
        fiatCurrencyCode: wallet.fiatCurrencyCode,
      })),
    ),
  )

export const useExchangeInfos = (account: EdgeAccount) => {
  const rerender = useRerender()
  useWatch(account, 'currencyWallets')

  React.useEffect(() => {
    const unsubs = Object.values(account.currencyWallets).flatMap((wallet) => [
      wallet.watch('enabledTokenIds', rerender),
      wallet.watch('fiatCurrencyCode', rerender),
    ])

    return () => unsubs.forEach((unsub) => unsub())
  }, [account.currencyWallets, rerender])

  return getExchangeInfos(account)
}

const RATE_SERVERS = ['https://rates1.edge.app', 'https://rates2.edge.app']
const CACHE_MS = 30_000

const cache = new Map<string, { rate: number; fetchedAt: number }>()
const inflight = new Map<string, Promise<number>>()

const toPairCode = (currencyCode: string) => {
  if (currencyCode.startsWith('iso:')) return currencyCode

  return (
    fiatInfos.find((info) => info.isoCurrencyCode === currencyCode || info.currencyCode === currencyCode)
      ?.isoCurrencyCode ?? currencyCode
  )
}

const fetchRate = async (fromCurrencyCode: string, toCurrencyCode: string) => {
  const pair = `${toPairCode(fromCurrencyCode)}_${toPairCode(toCurrencyCode)}`
  const cached = cache.get(pair)
  if (cached && Date.now() - cached.fetchedAt < CACHE_MS) return cached.rate

  const pending = inflight.get(pair)
  if (pending) return pending

  const request = (async () => {
    let lastError: unknown

    for (const server of RATE_SERVERS) {
      try {
        const response = await fetch(`${server}/v2/exchangeRate?currency_pair=${encodeURIComponent(pair)}`)
        if (!response.ok) throw new Error(await response.text())

        const json: { exchangeRate?: string } = await response.json()
        const rate = Number(json.exchangeRate)
        if (!Number.isFinite(rate)) throw new Error(`Invalid rate for ${pair}`)

        cache.set(pair, { rate, fetchedAt: Date.now() })

        return rate
      } catch (error) {
        lastError = error
      }
    }

    throw lastError
  })().finally(() => {
    inflight.delete(pair)
  })

  inflight.set(pair, request)

  return request
}

export const convertCurrency = async (fromCurrencyCode: string, toCurrencyCode: string, amount: number) => {
  if (fromCurrencyCode === toCurrencyCode) return amount
  if (!Number.isFinite(amount) || amount === 0) return 0

  try {
    return amount * (await fetchRate(fromCurrencyCode, toCurrencyCode))
  } catch {
    return 0
  }
}
