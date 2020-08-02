import { EdgeDenomination } from 'edge-core-js'

import { FiatInfo, fiatInfos } from './fiatInfos'

export const getFiatInfo = (currencyCode: string): FiatInfo & { denominations: EdgeDenomination[] } => {
  const info = fiatInfos.find((fiatInfo) => fiatInfo.isoCurrencyCode.includes(currencyCode))!

  return {
    ...info,
    denominations: [{ name: info.currencyCode, symbol: info.symbol, multiplier: '1' }],
  }
}
