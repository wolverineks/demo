import React from 'react'

import { getFiatInfo } from '../hooks'
import { UNKNOWN_CURRENCY_ICON } from '../utils'

export const FiatLogo: React.FC<{ fiatCurrencyCode: string }> = ({ fiatCurrencyCode }) => {
  const fiatInfo = getFiatInfo(fiatCurrencyCode)
  const [failed, setFailed] = React.useState(false)
  const src = failed ? UNKNOWN_CURRENCY_ICON : fiatInfo.symbolImage

  React.useEffect(() => {
    setFailed(false)
  }, [fiatCurrencyCode])

  return (
    <img
      alt={fiatInfo.currencyCode}
      src={src}
      className="currency-logo"
      onError={() => setFailed(true)}
    />
  )
}
