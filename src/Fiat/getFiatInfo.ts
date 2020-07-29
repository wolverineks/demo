import { fiatInfos } from './fiatInfos'

export const getFiatInfo = (currencyCode: string) =>
  fiatInfos.find((fiatInfo) => fiatInfo.isoCurrencyCode.includes(currencyCode))!
