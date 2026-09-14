import { EdgeAccount } from 'edge-core-js'
import React from 'react'

/** Rate plugins left the core in 2.0. Identity conversion until a rates source is wired. */
export const convertCurrency = async (fromCurrencyCode: string, toCurrencyCode: string, amount: number) => {
  if (fromCurrencyCode === toCurrencyCode) return amount

  return 0
}

export const useOnRateChange = (_account: EdgeAccount, _callback: () => any) => {
  React.useEffect(() => {
    return () => undefined
  }, [_account, _callback])
}