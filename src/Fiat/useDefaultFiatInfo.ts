import { EdgeAccount } from 'edge-core-js'

import { getFiatInfo } from './getFiatInfo'
import { useDefaultFiatCurrencyCode } from './useDefaultFiatCurrencyCode'

export const useDefaultFiatInfo = ({ account }: { account: EdgeAccount }) => {
  const currencyCode = useDefaultFiatCurrencyCode({ account })[0]

  return getFiatInfo({ currencyCode })
}
